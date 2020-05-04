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
            if (!data.registered && person.type === 'clients') {
                document.cookie = "unauthorised_userid=" + data.userid;
                document.cookie = 'unauthorised=' + type;
                window.location = '/changepassword';
            } else {
                document.cookie = "userid=" + data.userid;
                document.cookie = 'authorised=' + type;
                window.location = '/profile';
            }
        },
        error: function () {
            alert("Перевірте правильність данних та спробуйте ще!");
            return false;
        },
        data: JSON.stringify(person)
    });
}

function exit() {
    document.cookie = 'userid=null;max-age=-1';
    document.cookie = 'authorised=null;max-age=-1';
    window.location = '/';
}

function renew_car_model(value) {
    let producerid = $("#select_carproducer").children("option:selected").val();
    let classSel = $('#carclassprofile');
    let car_class = classSel.children("option:selected").val();
    if (car_class === undefined) {
        car_class = $('input[name="car_class"]:checked').val();
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
            console.log(data);
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

function loadSubmit() {
    const emailSelector = $("#driver_email");
    let loginSelector = $("#driver_login");
    const selectorsids = ["#select_category", "#select_carproducer", "#select_carmodel"];
    const isValid = [!validateName("#driver_name"), !validateName("#driver_surname"),
        !validAge("#driver_age"), !validateTel("#driver_tel"), !validSeria("#driver_seria"),
        !validSeriaNum("#driver_seria_num"), !validPassword("#driver_pass", "#driver_pass_conf"),
        !validSelectors(selectorsids), !validAutoNum("driver_autonum"), !validEmptyAndSetKeyup(emailSelector),
        !validEmptyAndSetKeyup(loginSelector)];
    if (isValid.includes(true)) {
        event.preventDefault();
        return false;
    }
    let login = loginSelector.val();
    const email = emailSelector.val() + $("#select_email").val();
    let licence = $("#driver_seria").val() + $("#driver_seria_num").val();
    let phoneSel = $("#driver_tel");
    let phone = phoneSel.val();
    const autonum = $("#driver_autonum1").val() + $("#driver_autonum2").val() + $("#driver_autonum3").val();
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
                accept: 'application/json',
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
                    "car_class": $('input[name="car_class"]:checked').val(),
                    "autonum": autonum
                })
            });
        },
        error: function (data) {
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
                alert("Перевірте ваш логін, номер телефону та пошту на унікальність!");
            }
            event.preventDefault();
            return false;
        },
        data: JSON.stringify({
            "login": login,
            "number": phone,
            "email": email,
            "client": false
        })
    });
}

function setValues() {
    let docs = document.getElementsByTagName("select");
    for (let i = 0; i < docs.length; i++) {
        docs[i].addEventListener("change", checkValueSelect);
        if (docs[i].value === "default") {
            docs[i].style.color = '#afb1b4';
        } else {
            docs[i].style.color = '#222222';
        }
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

function checkLogin(logSelector, type) {
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
        accept: 'application/json',
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
            "login": login,
            "type": type
        })
    });
}

async function checkFreeLoginClient() {
    let logSelector = $("#profile_login");
    if (logSelector.val() === JSON.parse(sessionStorage.getItem("profile"))) {
        logSelector.addClass("is-valid");
        logSelector.keyup(function () {
            logSelector.removeClass("is-valid");
            logSelector.removeClass("is-invalid");
        });
        return;
    }
    return checkLogin(logSelector, "clients");
}

function checkRegisterFreeLogin() {
    let logSelector = $("#client_login");
    logSelector.keyup(function () {
        logSelector.removeClass("is-valid");
        logSelector.removeClass("is-invalid");
    });
    return checkLogin(logSelector, "clients");
}

async function checkFreeLogin() {
    let logSelector = $("#driver_login");
    if (logSelector.val() === undefined) {
        logSelector = $("#profile_login");
        if (logSelector.val() === JSON.parse(sessionStorage.getItem("profile")).login) {
            logSelector.addClass("is-valid");
            logSelector.keyup(function () {
                logSelector.removeClass("is-valid");
                logSelector.removeClass("is-invalid");
            });
            return true;
        }
    }
    return checkLogin(logSelector, "drivers");
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
        url: '/password',
        type: 'put',
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
        $("#checkLogin").hide();
        const editSel = $("#editprofilebutton");
        editSel.show();
        editSel.prop("disabled", false);
        $("#saveprofilebutton").hide();
        $("#canselprofilebutton").hide();
        $("#upload_photo").hide();
    } else {
        $(".driver_auto input[type=number]").prop("disabled", false);
        $(".driver_auto select").prop("disabled", false);
        $(".main_profile_part input").prop("disabled", false);
        $("#profile_desc").prop("disabled", false);
        $("#profile_email").prop("disabled", true);
        $("#carnumber").prop("disabled", true);
        $("#change_password").prop("disabled", true);
        $("#editprofilebutton").hide();
        $("#checkLogin").show();
        $("#saveprofilebutton").show();
        $("#canselprofilebutton").show();
        $("#upload_photo").show();
    }
}

function editClientProfile() {
    let profileData = {
        "login": $("#profile_login").val(),
        "name": $("#profile_name").val(),
        "surname": $("#profile_surname").val(),
        "age": $("#profile_age").val(),
        "phone": $("#profile_phone").val(),
        "desc": $("#profile_desc").val(),
        "photo_src": $("#photo").attr("src")
    };
    sessionStorage.setItem("profile", JSON.stringify(profileData));
    showEditingProfile(false);
}

function canselClientChanges() {
    let arr = JSON.parse(sessionStorage.getItem("profile"));
    $("#profile_login").val(arr.login);
    $("#profile_name").val(arr.name);
    $("#profile_surname").val(arr.surname);
    $("#profile_age").val(arr.age);
    $("#profile_phone").val(arr.phone);
    $("#profile_desc").val(arr.desc);
    $("#photo").attr("src", arr.photo_src);
    showEditingProfile(true);
    sessionStorage.removeItem("profile");
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
        "photo_src": $("#photo").attr("src")
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
    $("#photo").attr("src", arr.photo_src);
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
    const profileData = {
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
    $.ajax({
        url: '/profile',
        type: 'put',
        contentType: 'application/json',
        accept: '*/*',
        success: function () {
            showEditingProfile(true);
            sessionStorage.removeItem("profile");
        },
        error: function () {
            canselDriverChanges();
            alert("<b>На сервері виникла якась помилка. Ваші дані не було змінено!</b><br/><span>" +
                "Можливо номер телефону який ви намагалися вказати вже вказаний у іншого водія</span>");
            sessionStorage.removeItem("profile");
        },
        data: JSON.stringify(profileData)
    });
}

function saveClientChanges() {
    const profileData = {
        "login": $("#profile_login").val(),
        "name": $("#profile_name").val(),
        "surname": $("#profile_surname").val(),
        "age": $("#profile_age").val(),
        "phone": $("#profile_phone").val(),
        "desc": $("#profile_desc").val()
    };
    $.ajax({
        url: '/profile',
        type: 'put',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            showEditingProfile(true);
            sessionStorage.removeItem("profile");
        },
        error: function () {
            cancelClientChanges();
            console.log("На сервері виникла якась помилка. Ваші дані не було змінено");
            sessionStorage.removeItem("profile");
        },
        data: JSON.stringify(profileData)
    });
}

function ordertaxi() {
    const address_from = $("#address_from").val();
    const address_to = $("#address_to").val();
    if (address_to === "" || address_from === "") {
        alert("Всі поля мають бути заповнені!");
        return;
    }
    const data = {
        "address_from": address_from,
        "address_to": address_to,
        "pay_type": $("#pay_type").val(),
        "clas": $("input[name='class']:checked").val(),
        "notes": $("#notes").val(),
        "price": $('#km_val').val()
    };
    $.ajax({
        url: '/orders/createorder',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data2) {
            if (data2.too_much) {
                $("#foralert").prepend("<div class='alert alert-danger alert-dismissible'>" +
                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                    "<strong>Перевищено ліміт!</strong> Ви вже маєте " + data2.count +
                    " активні (незавершені) поїздки. Для нового замовлення спершу завершіть або скасуйте їх. " +
                    "</div>");
            } else
                window.location = "/thankspage";
        },
        error: function (data2) {
            $("#foralert").prepend("<div class='alert alert-danger alert-dismissible'>" +
                "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                "<strong>Помилка!</strong> Чомусь не вдалося обробити вашу заявку. <a href='#' onclick='ordertaxi()'>Спробуйте ще!</a>" +
                "</div>");
            console.log(data2.err);
        },
        data: JSON.stringify(data)
    });
}

function getOrder(id) {
    $.ajax({
        url: '/acceptOrder',
        type: 'post',
        success: function () {
            window.location = '/orders/my';
        },
        error: function () {
            $("#order_modal_alert").modal("toggle");
        },
        data: {
            "orderid": id
        }
    });
}

function renew_orders_method() {
    $.ajax({
        url: '/orders/all',
        type: 'get',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            $("#orders").html(data);
        },
        error: function (data) {
            console.log(data.err);
        },
        data: JSON.stringify({})
    });
}

function setFooter() {
    $.ajax({
        url: '/getfooter',
        type: 'get',
        dataType: 'text',
        contentType: 'text',
        success: function (data) {
            $("#for_footer").html(data);
        },
        error: function (data) {
            console.log(data.err);
        }
    });
}

function sendNewProfilePhoto() {
    var formData = new FormData($("#upload_photo")[0]);
    $.ajax({
        url: '/upload_user_photo',
        type: "POST",
        data: formData,
        success: function (data) {
            console.log(data);
            if (!data.empty) {
                document.getElementById("photo").setAttribute("src", data.src);
            }
        },
        error: function () {
            alert('Sorry something happened on server');
        },
        contentType: false,
        processData: false
    });
}

function endDrive(order_id) {
    $.ajax({
        url: '/orders/endDrive',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            window.location = '/orders/my';
        },
        data: JSON.stringify({"order_id": order_id})
    });
}

function cancelDrive(order_id) {
    $.ajax({
        url: '/orders/cancelDrive',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            window.location = '/orders/my';
        },
        data: JSON.stringify({"order_id": order_id})
    });
}

function showRegisterModal() {
    $('#register').modal('toggle');
    $('#login').modal('toggle');
}

function firstChangePass() {
    if (!validPassword('#new_pass', '#new_pass2')) {
        return;
    }
    $.ajax({
        url: '/changepass',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            if (!data.data) {
                $("#uncorrect_alert").style("display", "block");
                $("#new_pass2").val("");
                $("#old_pass").val("");
            } else {
                document.cookie = 'unauthorised_userid=null;max-age=-1';
                document.cookie = 'unauthorised=null;max-age=-1';
                window.location = '/aboutus';
            }
        },
        data: JSON.stringify({
            "old_pass": $("#old_pass").val(),
            "new_pass": $("#new_pass").val()
        })
    });
}

function registerUser() {
    const emailSelector = $("#client_email");
    let loginSelector = $("#client_login");
    const isValid = [!validateName("#client_name"), !validateName("#client_surname"),
        !validAge("#client_age"), !validateTel("#client_tel"),
        !validEmptyAndSetKeyup(emailSelector), !validEmptyAndSetKeyup(loginSelector)];
    console.log(isValid);
    if (isValid.includes(true)) {
        event.preventDefault();
        return false;
    }
    let login = loginSelector.val();
    const email = emailSelector.val() + $("#select_email").val();
    let phoneSel = $("#client_tel");
    let phone = phoneSel.val();
    $.ajax({
        url: '/isAllFree',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function () {
            loginSelector.addClass("is-valid");
            loginSelector.removeClass("is-invalid");
        },
        error: function (data) {
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
                alert("Перевірте ваш логін, номер телефону та пошту на унікальність!");
            }
            event.preventDefault();
            return false;
        },
        data: JSON.stringify({
            "login": login,
            "number": phone,
            "email": email,
            "client": true
        })
    });
}

function calcPrice() {
    const d = sessionStorage.getItem("distance");
    if (d === null) return;
    $.ajax({
        url: '/orders/calcprice',
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            document.getElementById('km_val').value = data.price + " грн.";
        },
        data: JSON.stringify({
            "km": d,
            "pay_type": $("#pay_type").val(),
            "clas": $("input[name='class']:checked").val(),
        })
    });
}