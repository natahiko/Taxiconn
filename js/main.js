function loginUser() {
    var passSelector = $("#log_pass");
    var login = $("#log_login").val();
    var pass = passSelector.val();
    var type = $("#log_type").children("option:selected").val();
    var redirect_url = $("#nowpage").val();
    if (type === "Оберіть як ви хочете увійти...") {
        return;
    } else if (type === "Клієнт") {
        type = "clients";
    } else if (type === "Водій") {
        type = "drivers";
    }
    passSelector.val("");
    if (login === "" || pass === "") {
        alert("Всі поля мають бути заповнені");
        return false;
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
        success: function () {
            $("body").append("<form style='display: none' action='" + redirect_url + "' method='get'>" +
                "<input type='submit' id='redirect'></form>");
            $("#redirect").click();
        },
        error: function () {
            alert("Перевірте правильність данних та спробуйте ще!");
            return false;
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
        success: function () {
            $("body").append("<form style='display: none' action='/' method='get'>" +
                "<input type='submit' id='redirect'></form>");
            $("#redirect").click();
        }
    });
}

function renew_car_model(value) {
    var producerid = $("#select_carproducer").children("option:selected").val();
    var classSel = $('#carclassprofile');
    var car_class;
    if (classSel === undefined) {
        car_class = $('input[name="car_class"]:checked').val();
    } else {
        car_class = classSel.children("option:selected").val();
    }
    var prods = {
        "producer": producerid,
        "carclass": car_class,
        "secret_key": "OiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4"
    };
    var carModelSelector = $("#select_carmodel");
    carModelSelector.empty();
    $.ajax({
        url: '/carmodel',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            var res = data.res;
            carModelSelector.append("<option value='default' class='default_option'>Оберіть марку</option>");
            for (var i = 0; i < res.length; i++) {
                carModelSelector.append("<option value='"+res[i].id+"'>" + res[i].model + "</option>");
            }
            $("#select_carmodel option[value="+value+"]").attr('selected', true);
        },
        data: JSON.stringify(prods)
    });
}

function becomedriver() {
    var nameSelector = $("#name");
    var name = nameSelector.val();
    if (name === "" || !validName(name)) {
        nameSelector.css.background = "red";
    }
}

function loadsubmit() {
    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('needs-validation');
        Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                var selectorsids = ["#select_carmodel", "#select_carproducer", "#select_category"];
                if (!validateName("#driver_name") || !validateName("#driver_surname") || !validAge("#driver_age")
                    || !validateTel("#driver_tel") || !validSeria("#driver_seria") ||
                    !validSeriaNum("#driver_seria_num") || !validPassword("#driver_pass", "#driver_pass_conf")
                    || !validSelectors(selectorsids)) {
                    event.preventDefault();
                }
                var emailSelector = $("#driver_email");
                var loginSelector = $("#driver_login");
                var login = loginSelector.val();
                var email = emailSelector.val();
                if (login === "") {
                    event.preventDefault();
                    return false;
                }
                if (email === "") {
                    emailSelector.addClass("is-invalid");
                    emailSelector.keyup(function () {
                        emailSelector.removeClass("is-invalid");
                    });
                    event.preventDefault();
                    return false;
                }
                email += $("#select_email").val();
                loginSelector.keyup(function () {
                    loginSelector.removeClass("is-valid");
                    loginSelector.removeClass("is-invalid");
                });
                var licence = $("#driver_seria").val() + $("#driver_seria_num").val();
                $.ajax({
                    url: '/isLoginFree',
                    type: 'post',
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function (data) {
                        if (data.free) {
                            loginSelector.addClass("is-valid");
                            loginSelector.removeClass("is-invalid");
                            $.ajax({
                                url: '/sendmail',
                                type: 'post',
                                dataType: 'json',
                                contentType: 'application/json',
                                success: function (data) {
                                    if (data.res) {
                                        return true;
                                    } else {
                                        emailSelector.addClass("is-invalid");
                                        emailSelector.keyup(function () {
                                            emailSelector.removeClass("is-invalid");
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
                                    "licence": licence,
                                    "car_producer": $("#select_carproducer").val(),
                                    "car_model": $("#select_carmodel").val(),
                                    "car_year": $("#car_year").val(),
                                    "password": $("#driver_pass").val(),
                                    "car_class": $('input[name="car_class"]:checked').val()
                                })
                            });
                        } else {
                            loginSelector.addClass("is-invalid");
                            loginSelector.removeClass("is-valid");
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
    if (options === "default") {
        this.style.color = '#afb1b4';
    } else {
        this.style.color = '#222222';
    }
}

async function checkFreeLogin() {
    var logSelector = $("#driver_login");
    var login = logSelector.val();
    if (login === "") {
        return false;
    }
    logSelector.keyup(function () {
        logSelector.removeClass("is-valid");
        logSelector.removeClass("is-invalid");
    });
    $.ajax({
        url: '/isLoginFree',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            if (data.free) {
                logSelector.addClass("is-valid");
                logSelector.removeClass("is-invalid");
                return true;
            } else {
                logSelector.addClass("is-invalid");
                logSelector.removeClass("is-valid");
                return false;
            }
        },
        data: JSON.stringify({
            "login": login
        })
    });
}

function changePass() {
    const oldPassSel = $("#old_change_pass");
    const passSel = $("#change_pass");
    const passSel2 = $("#change_pass2");
    var oldPass = oldPassSel.val();
    var pass = passSel.val();

    if (oldPass.length < 4) {
        oldPassSel.addClass("is-invalid");
        oldPassSel.click(function () {
            oldPassSel.removeClass('is-invalid');
        });
        return false;
    }
    if (!validPassword("#change_pass", "#change_pass2")) {
        return false;
    }
    const sended = {
        "old": oldPass,
        "now": pass
    };
    $.ajax({
        url: '/changePass',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            $("#profilesection").prepend("<div class='alert alert-success alert-dismissible'>" +
                "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                "<strong>Ваш пароль успішно змінено!</strong></div>");
            $("#cancelchangepass").click();

            oldPassSel.val("");
            passSel.val("");
            passSel2.val("");
            return true;
        },
        error: function (data) {
            if (data.err === 'uncorect old') {
                oldPassSel.addClass("is-invalid");
                oldPassSel.click(function () {
                    oldPassSel.removeClass('is-invalid');
                });
                passSel2.val("");
            } else {
                alert(data.err);
                passSel2.val("");
            }
            return false;
        },
        data: JSON.stringify(sended)
    });
}

function editClientProfile() {
    $(".driver_auto input").prop("disabled", false);
    $(".main_profile_part input").prop("disabled", false);
    $(".main_profile_part input:button").prop("disabled", true);
    $("#editprofilebutton").hide();
    $("#saveprofilebutton").show();
}

function editDriverProfile() {
    $(".driver_auto input").prop("disabled", false);
    $(".main_profile_part input").prop("disabled", false);
    $(".driver_auto select").prop("disabled", false);
    $(".main_profile_part input:button").prop("disabled", true);
    $(".main_profile_part textarea").prop("disabled", false);
    $("#editprofilebutton").hide();
    $("#saveprofilebutton").show();
}

function saveDriverChanges() {
    //TODO
    $(".driver_auto input").prop("disabled", true);
    $(".main_profile_part input").prop("disabled", true);
    $(".main_profile_part input:button").prop("disabled", false);
    $(".main_profile_part textarea").prop("disabled", true);
    $(".driver_auto select").prop("disabled", true);
    $("#editprofilebutton").show();
    $("#saveprofilebutton").hide();
}

function saveClientChanges() {
    //TODO
    $(".driver_auto input").prop("disabled", true);
    $(".main_profile_part input").prop("disabled", true);
    $(".main_profile_part input:button").prop("disabled", false);
    $("#editprofilebutton").show();
    $("#saveprofilebutton").hide();
}