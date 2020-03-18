function loginUser() {
    var login = $("#log_login").val();
    var pass = $("#log_pass").val();
    var type = $("#log_type").children("option:selected").val();
    var redirect_url = $("#nowpage").val();
    if (type == 'Оберіть як ви хочете увійти...') {
        return;
    } else if (type == 'Клієнт') {
        type = "clients";
    } else if (type == 'Водій') {
        type = "drivers";
    }
    $("#log_pass").val("");
    if (login == "" || pass == "") {
        alert("Всі поля мають бути заповнені");
        return;
    }
    var person = {
        "login": login,
        "password": pass,
        "type": type
    };
    $.ajax({
        url: '/login',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            $("body").append("<form style='display: none' action='" + redirect_url + "' method='get'>" +
                "<input type='submit' id='redirect'></form>");
            $("#redirect").click();
        },
        error: function () {
            alert("Перевірте правильність данних та спробуйте ще!");
        },
        data: JSON.stringify(person)
    });
}

function exit() {
    $.ajax({
        url: '/exit',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            $("body").append("<form style='display: none' action='/' method='get'>" +
                "<input type='submit' id='redirect'></form>");
            $("#redirect").click();
        }
    });
}

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

function renew_car_model() {
    var producer = $("#select_carproducer").children("option:selected").val();
    var prods = {
        "producer": producer,
        "secret_key": "OiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4"
    };
    $("#select_carmodel").empty();
    $.ajax({
        url: '/carmodel',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            var res = data.res;
            var selector = $("#select_carmodel");
            selector.append("<option value='default' class='default_option'>Оберіть марку</option>");
            for (var i = 0; i < res.length; i++) {
                selector.append("<option>" + res[i].model + "</option>");
            }
        },
        data: JSON.stringify(prods)
    });
}

function becomedriver() {
    var name = $("#name").val();
    if (name == "" || !validName(name)) {
        $("#name").css.background = "red";
    }
    var name = $("#name").val();

}

function loadsubmit() {
    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('needs-validation');
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                var selectorsids = ["#select_carmodel", "#select_carproducer", "#select_category"];
                if (!validateName("#driver_name") || !validateName("#driver_surname") || !validAge("#driver_age")
                    || !validateTel("#driver_tel") || !validSeria("#driver_seria") ||
                    !validSeriaNum("#driver_seria_num") || !validPassword("#driver_pass", "#driver_pass_conf")
                    || !validSelectors(selectorsids)) {
                    event.preventDefault();
                }
                var login = $("#driver_login").val();
                var email = $("#driver_email").val();
                if(login==""){
                    event.preventDefault();
                    return false;
                }
                if(email==""){
                    $("#driver_email").addClass("is-invalid");
                    $("#driver_email").keyup(function () {
                        $("#driver_email").removeClass("is-invalid");
                    });
                    event.preventDefault();
                    return false;
                }
                email += $("#select_email").val();
                $("#driver_login").keyup(function () {
                    $("#driver_login").removeClass("is-valid");
                    $("#driver_login").removeClass("is-invalid");
                });
                $.ajax({
                    url: '/isLoginFree',
                    type: 'post',
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data) {
                        if(data.free){
                            $("#driver_login").addClass("is-valid");
                            $("#driver_login").removeClass("is-invalid");
                            $.ajax({
                                url: '/sendmail',
                                type: 'post',
                                dataType: 'json',
                                contentType: 'application/json',
                                success: function (data) {
                                    if(data.res){
                                        return true;
                                    } else{
                                        $("#driver_email").addClass("is-invalid");
                                        $("#driver_email").keyup(function () {
                                            $("#driver_email").removeClass("is-invalid");
                                        });
                                        event.preventDefault();
                                        return false;
                                    }
                                },
                                data: JSON.stringify({
                                    "email": email,
                                    "name": $("#driver_name").val(),
                                    "surname": $("#driver_surname").val(),
                                    "age": $("#driver_age").val(),
                                    "login": login,
                                    "phone": $("#driver_tel").val(),
                                    "description": $("#driver_desc").val(),
                                    "licence": $("#driver_seria").val() + $("#driver_seria_num").val(),
                                    "car_producer": $("#select_carproducer").val(),
                                    "car_model": $("#select_carmodel").val(),
                                    "car_year": $("#car_year").val(),
                                    "password": $("#driver_pass").val(),
                                    "car_class": $('input[name="car_class"]:checked').val()
                                })
                            });
                        } else{
                            $("#driver_login").addClass("is-invalid");
                            $("#driver_login").removeClass("is-valid");
                            event.preventDefault();
                            return false;
                        }
                    },
                    data: JSON.stringify({
                        "login": login
                    })
                });
            }, false);
        });
    }, false);
}

function setValues() {
    var docs = document.getElementsByTagName("select");
    for (var i = 0; i < docs.length; i++) {
        docs[i].addEventListener("change", checkValueSelect);
        docs[i].style.color = '#afb1b4';
    }
}

function checkValueSelect() {
    var options = this.value;
    if (options == "default") {
        this.style.color = '#afb1b4';
    } else {
        this.style.color = '#222222';
    }
}

async function checkFreeLogin() {
    var login = $("#driver_login").val();
    if(login==""){
        return false;
    }
    $("#driver_login").keyup(function () {
        $("#driver_login").removeClass("is-valid");
        $("#driver_login").removeClass("is-invalid");
    });
    $.ajax({
        url: '/isLoginFree',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            if(data.free){
                $("#driver_login").addClass("is-valid");
                $("#driver_login").removeClass("is-invalid");
                return true;
            } else{
                $("#driver_login").addClass("is-invalid");
                $("#driver_login").removeClass("is-valid");
                return false;
            }
        },
        data: JSON.stringify({
            "login": login
        })
    });
}