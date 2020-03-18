function validName(name) {
    return /^[a-zA-ZА-Яа-яІ-і]+$/.test(name);
}

function validateName(nameId) {
    var name = $(nameId).val();
    if (name == "" || !validName(name)) {
        $(nameId).removeClass('is-valid');
        $(nameId).addClass('is-invalid');
        $(nameId).keyup(function () {
            var val = $(nameId).val();
            if (val != "" && validName(val)) {
                $(nameId).removeClass('is-invalid');
                $(nameId).addClass('is-valid');
            } else {
                $(nameId).addClass('is-invalid');
            }
        });
        return false;
    }
    return true;
}

function validTel(tel) {
    var pattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return pattern.test(tel);
}

function validateTel(telId) {
    var tel = $(telId).val();
    if (tel == "" || !validTel(tel)) {
        $(telId).removeClass('is-valid');
        $(telId).addClass('is-invalid');
        $(telId).keyup(function () {
            var val = $(telId).val();
            if (val.length > 0 && val.length < 10) {
                $(telId).removeClass('is-valid');
                $(telId).removeClass('is-invalid');
            }
            if (val != "" && validTel(val)) {
                $(telId).removeClass('is-invalid');
                $(telId).addClass('is-valid');
            } else {
                $(telId).addClass('is-invalid');
            }
        });
        return false;
    }
    return true;
}

function validSeria(seriaid) {
    var seria = $(seriaid).val();
    if (seria.length != 3 || !validateName(seria)) {
        $(seriaid).removeClass('is-valid');
        $(seriaid).addClass('is-invalid');
        $(seriaid).keyup(function () {
            var val = $(seriaid).val();
            if (val.length == 3 || validateName(val)) {
                $(seriaid).removeClass('is-invalid');
                $(seriaid).addClass('is-valid');
            } else {
                $(seriaid).addClass('is-invalid');
            }
        });
        return false;
    }
    return true;
}


function validateSeriaNum(val) {
    if (val.length < 5 || val.length > 10) {
        return false;
    }
    return /^[0-9]+$/.test(val);
}

function validSeriaNum(numId) {
    var seria = $(numId).val();
    if (!validateSeriaNum(seria)) {
        $(numId).removeClass('is-valid');
        $(numId).addClass('is-invalid');
        $(numId).keyup(function () {
            var val = $(numId).val();
            if (validateSeriaNum(val)) {
                $(numId).removeClass('is-invalid');
                $(numId).addClass('is-valid');
            } else {
                $(numId).addClass('is-invalid');
            }
        });
        return false;
    }
    return true;
}

function validatePass(pass) {
    if (pass.length < 6) {
        return false;
    }
    if (/^[0-9]+$/.test(pass) || /^[a-zA-ZА-Яа-яІ-і]+$/.test(pass)) {
        return false;
    }
    if (pass == pass.toLowerCase() || pass == pass.toUpperCase()) {
        return false;
    }
    return true;

}

function validPassword(passid, confid) {
    var pass = $(passid).val();
    if (!validatePass(pass)) {
        $(passid).addClass('is-invalid');
        $(passid).keyup(function () {
            var pass = $(passid).val();
            if (validatePass(pass)) {
                $(passid).removeClass('is-invalid');
                $(passid).addClass('is-valid');
            } else {
                $(passid).addClass('is-invalid');
                $(passid).removeClass('is-valid');
            }
        });
        $(confid).val("");
        return false;
    }
    if ($(confid).val() != pass) {
        $(confid).addClass('is-invalid');
        $(confid).keyup(function () {
            $(confid).removeClass('is-invalid');
        });
        $(confid).val("");
        return false;
    }
    return true;
}

function validAge(ageid) {
    var age = $(ageid).val();
    if (age == "" || age < 21 || age > 65) {
        $(ageid).addClass('is-invalid');
        $(ageid).click(function () {
            $(ageid).removeClass('is-invalid');
        });
        return false;
    }
    return true;
}

function validSelectors(selectorsids) {
    for (var i = 0; i < selectorsids.length; i++) {
        var id = selectorsids[i];
        var val = $(id).val();
        alert(val);
        if (val == 'default') {
            $(id).addClass("is-invalid");
            $(id).click(function () {
                $(id).removeClass('is-invalid');
            });
            return false;
        }
    }
    return true;
}