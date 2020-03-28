function loginUser() {
    let passSelector = $("#log_pass");
    let login = $("#log_login").val();
    let pass = passSelector.val();
    let type = $("#log_type").children("option:selected").val();
    if (type === "Оберіть як ви хочете увійти...") {
        return;
    }
    passSelector.val("");
    if (login === "" || pass === "") {
        alert("Всі поля мають бути заповнені");
        return false;
    }
    const person = {
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
            document.cookie = "userid=" + data.userid;
            document.cookie = 'autorised=' + type;
            window.location = '/profile';
        },
        error: function () {
            alert("Перевірте правильність данних та спробуйте ще!");
            return false;
        },
        data: JSON.stringify(person)
    });
}

function exit() {
    window.location = '/';
    document.cookie = 'userid=null;max-age=-1';
    document.cookie = 'autorised=null;max-age=-1';
}

function renew_car_model(value) {
    let producerid = $("#select_carproducer").children("option:selected").val();
    let classSel = $('#carclassprofile');
    let car_class;
    if (classSel === undefined) {
        car_class = $('input[name="car_class"]:checked').val();
    } else {
        car_class = classSel.children("option:selected").val();
    }
    let prods = {
        "producer": producerid,
        "carclass": car_class,
        "secret_key": "OiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4"
    };
    let carModelSelector = $("#select_carmodel");
    carModelSelector.empty();
    $.ajax({
        url: '/carmodel',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            let res = data.res;
            carModelSelector.append("<option value='default' class='default_option'>Оберіть марку</option>");
            for (let i = 0; i < res.length; i++) {
                carModelSelector.append("<option value='" + res[i].id + "'>" + res[i].model + "</option>");
            }
            $("#select_carmodel option[value=" + value + "]").attr('selected', true);
        },
        data: JSON.stringify(prods)
    });
}

function becomedriver() {
    let nameSelector = $("#name");
    let name = nameSelector.val();
    if (name === "" || !validName(name)) {
        nameSelector.css.background = "red";
    }
}

function loadsubmit() {
    window.addEventListener('load', function () {
        let forms = document.getElementsByClassName('needs-validation');
        Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                let selectorsids = ["#select_carmodel", "#select_carproducer", "#select_category"];
                if (!validateName("#driver_name") || !validateName("#driver_surname") || !validAge("#driver_age")
                    || !validateTel("#driver_tel") || !validSeria("#driver_seria") ||
                    !validSeriaNum("#driver_seria_num") || !validPassword("#driver_pass", "#driver_pass_conf")
                    || !validSelectors(selectorsids)) {
                    event.preventDefault();
                }
                let emailSelector = $("#driver_email");
                emailSelector.keyup(function () {
                    emailSelector.removeClass("is-valid");
                    emailSelector.removeClass("is-invalid");
                });
                let loginSelector = $("#driver_login");
                let login = loginSelector.val();
                let email = emailSelector.val();
                if (login === "") {
                    event.preventDefault();
                    return false;
                }
                if (email === "") {
                    emailSelector.addClass("is-invalid");
                    event.preventDefault();
                    return false;
                }
                email += $("#select_email").val();
                loginSelector.keyup(function () {
                    loginSelector.removeClass("is-valid");
                    loginSelector.removeClass("is-invalid");
                });
                let licence = $("#driver_seria").val() + $("#driver_seria_num").val();
                let phoneSel = $("#driver_tel");
                phoneSel.keyup(function () {
                    phoneSel.removeClass("is-valid");
                    phoneSel.removeClass("is-invalid");
                });
                let phone = phoneSel.val();
                $.ajax({
                    url: '/isAllFree',
                    type: 'post',
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function () {
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
                                "phone": phone,
                                "description": $("#driver_desc").val(),
                                "licence": licence,
                                "car_producer": $("#select_carproducer").val(),
                                "car_model": $("#select_carmodel").val(),
                                "car_year": $("#car_year").val(),
                                "password": $("#driver_pass").val(),
                                "car_class": $('input[name="car_class"]:checked').val()
                            })
                        });
                    },
                    error: function (data) {
                        consol.log(data);
                        if (data.login) {
                            loginSelector.addClass("is-invalid");
                            loginSelector.removeClass("is-valid");
                        }
                        if (data.email) {
                            emailSelector.addClass("is-invalid");
                            emailSelector.removeClass("is-valid");
                        }
                        if (data.phone) {
                            phoneSel.addClass("is-invalid");
                            phoneSel.removeClass("is-valid");
                        } else {
                            alert("Перевірте всі поля на правильність");
                        }
                        event.preventDefault();
                        return false;
                    },
                    data: JSON.stringify({
                        "login": login,
                        "number": phone,
                        "email": email
                    })
                });
            }, false);
        });
    }, false);
}

function setValues() {
    let docs = document.getElementsByTagName("select");
    for (let i = 0; i < docs.length; i++) {
        docs[i].addEventListener("change", checkValueSelect);
        docs[i].style.color = '#afb1b4';
    }
}

function checkValueSelect() {
    let options = this.value;
    if (options === "default") {
        this.style.color = '#afb1b4';
    } else {
        this.style.color = '#222222';
    }
}

async function checkFreeLogin() {
    let logSelector = $("#driver_login");
    let login = logSelector.val();
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
            } else {
                logSelector.addClass("is-invalid");
                logSelector.removeClass("is-valid");
            }
        },
        data: JSON.stringify({
            "login": login
        })
    });
}

function changePass(usertype) {
    const oldPassSel = $("#old_change_pass");
    const passSel = $("#change_pass");
    const passSel2 = $("#change_pass2");
    let oldPass = oldPassSel.val();
    let pass = passSel.val();

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
        "now": pass,
        "type": usertype
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

function showEditingProfile(val) {
    if (val) {
        $(".driver_auto input[type=number]").prop("disabled", true);
        $(".driver_auto select").prop("disabled", true);
        $(".main_profile_part input").prop("disabled", true);
        $("#change_password").prop("disabled", false);
        $("#profile_desc").prop("disabled", true);
        $("#editprofilebutton").show();
        $("#saveprofilebutton").hide();
        $("#canselprofilebutton").hide();
    } else {
        $(".driver_auto input[type=number]").prop("disabled", false);
        $(".driver_auto select").prop("disabled", false);
        $(".main_profile_part input").prop("disabled", false);
        $("#profile_desc").prop("disabled", false);
        $("#profile_email").prop("disabled", true);
        $("#change_password").prop("disabled", true);
        $("#editprofilebutton").hide();
        $("#saveprofilebutton").show();
        $("#canselprofilebutton").show();
    }
}

function editClientProfile() {
    let profileData = {
        "login": $("#profile_login").val(),
        "name": $("#profile_name").val(),
        "surname": $("#profile_surname").val(),
        "age": $("#profile_age").val(),
        "phone": $("#profile_phone").val(),
        "desc": $("#profile_desc").val()
    };
    sessionStorage.setItem("profile", JSON.stringify(profileData));
    showEditingProfile(false);
}

function editDriverProfile() {
    let profileData = {
        "login": $("#profile_login").val(),
        "name": $("#profile_name").val(),
        "surname": $("#profile_surname").val(),
        "age": $("#profile_age").val(),
        "phone": $("#profile_phone").val(),
        "desc": $("#profile_desc").val(),
        "class": $("#carclassprofile").children("option:selected").val(),
        "producer": $("#select_carproducer").children("option:selected").val(),
        "model": $("#select_carmodel").children("option:selected").val(),
        "year": $("#profile_carid").val(),
    };
    console.log(profileData);
    sessionStorage.setItem("profile", JSON.stringify(profileData));
    showEditingProfile(false);
}

function canselDriverChanges() {
    let arr = JSON.parse(sessionStorage.getItem("profile"));
    $("#profile_login").val(arr.login);
    $("#profile_name").val(arr.name);
    $("#profile_surname").val(arr.surname);
    $("#profile_age").val(arr.age);
    $("#profile_phone").val(arr.phone);
    $("#profile_desc").val(arr.desc);
    $("#profile_carid").val(arr.year);
    showEditingProfile(true);
    $("#carclassprofile").val(arr.class);
    $("#select_carproducer").val(arr.producer);
    renew_car_model(arr.model);
    sessionStorage.removeItem("profile");
}

function cancelClientChanges() {
    let arr = JSON.parse(sessionStorage.getItem("profile"));
    $("#profile_login").val(arr.login);
    $("#profile_name").val(arr.name);
    $("#profile_surname").val(arr.surname);
    $("#profile_age").val(arr.age);
    $("#profile_phone").val(arr.phone);
    $("#profile_desc").val(arr.desc);
    showEditingProfile(true);
    sessionStorage.removeItem("profile");
}

function saveDriverChanges() {
    $.ajax({
        url: '/updateDriver',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            showEditingProfile(true);
            sessionStorage.removeItem("profile");
        },
        error: function (data) {
            alert(data.err);
            canselDriverChanges();
            sessionStorage.removeItem("profile");
        },
        data: sessionStorage.getItem("profile")
    });
}

function saveClientChanges() {
    $.ajax({
        url: '/updateClient',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            showEditingProfile(true);
            sessionStorage.removeItem("profile");
        },
        error: function (data) {
            alert(data.err);
            cancelClientChanges();
            sessionStorage.removeItem("profile");
        },
        data: sessionStorage.getItem("profile")
    });
}
