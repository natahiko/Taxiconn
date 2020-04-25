function validName(name) {
    return /^[a-zA-ZА-Яа-яІ-і]+$/.test(name);
}

function validateName(nameId) {
    let name = $(nameId).val();
    if (name === "" || !validName(name)) {
        $(nameId).removeClass('is-valid');
        $(nameId).addClass('is-invalid');
        $(nameId).keyup(function () {
            let val = $(nameId).val();
            if (val !== "" && validName(val)) {
                $(nameId).removeClass('is-invalid');
                $(nameId).addClass('is-valid');
            } else {
                $(nameId).addClass('is-invalid');
            }
        });
        return false;
    }
    $(nameId).removeClass('is-invalid');
    $(nameId).addClass('is-valid');
    $(nameId).keyup(function () {
        $(nameId).removeClass('is-valid');
    });
    return true;
}

function validTel(tel) {
    let pattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return pattern.test(tel);
}

function validateTel(telId) {
    let tel = $(telId).val();
    if (tel === "" || !validTel(tel)) {
        $(telId).removeClass('is-valid');
        $(telId).addClass('is-invalid');
        $(telId).keyup(function () {
            let val = $(telId).val();
            if (val.length > 0 && val.length < 10) {
                $(telId).removeClass('is-valid');
                $(telId).removeClass('is-invalid');
            }
            if (val !== "" && validTel(val)) {
                $(telId).removeClass('is-invalid');
                $(telId).addClass('is-valid');
            } else {
                $(telId).addClass('is-invalid');
            }
        });
        return false;
    }
    $(telId).removeClass('is-invalid');
    $(telId).addClass('is-valid');
    $(telId).keyup(function () {
        $(telId).removeClass('is-valid');
    });
    return true;
}

function validSeria(seriaid) {
    let seria = $(seriaid).val();
    if (seria.length !== 3 || !validateName(seria)) {
        $(seriaid).removeClass('is-valid');
        $(seriaid).addClass('is-invalid');
        $(seriaid).keyup(function () {
            let val = $(seriaid).val();
            if (val.length === 3 || validateName(val)) {
                $(seriaid).removeClass('is-invalid');
                $(seriaid).addClass('is-valid');
            } else {
                $(seriaid).addClass('is-invalid');
            }
        });
        return false;
    }

    $(seriaid).removeClass('is-invalid');
    $(seriaid).addClass('is-valid');
    $(seriaid).keyup(function () {
        $(seriaid).removeClass('is-valid');
    });
    return true;
}


function validateSeriaNum(val) {
    if (val.length < 5 || val.length > 10) {
        return false;
    }
    return /^[0-9]+$/.test(val);
}

function validSeriaNum(numId) {
    let seria = $(numId).val();
    if (!validateSeriaNum(seria)) {
        $(numId).removeClass('is-valid');
        $(numId).addClass('is-invalid');
        $(numId).keyup(function () {
            let val = $(numId).val();
            if (validateSeriaNum(val)) {
                $(numId).removeClass('is-invalid');
                $(numId).addClass('is-valid');
            } else {
                $(numId).addClass('is-invalid');
            }
        });
        return false;
    }
    $(numId).removeClass('is-invalid');
    $(numId).addClass('is-valid');
    $(numId).keyup(function () {
        $(numId).removeClass('is-valid');
    });
    return true;
}

function validatePass(pass) {
    if (pass.length < 6) {
        return false;
    }
    if (/^[0-9]+$/.test(pass) || /^[a-zA-ZА-Яа-яІ-і]+$/.test(pass)) {
        return false;
    }
    return !(pass === pass.toLowerCase() || pass === pass.toUpperCase());
}

function validPassword(passid, confid) {
    let pass = $(passid).val();
    if (!validatePass(pass)) {
        $(passid).addClass('is-invalid');
        $(passid).keyup(function () {
            let pass = $(passid).val();
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
    if ($(confid).val() !== pass) {
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
    let age = $(ageid).val();
    if (age === "" || age < 21 || age > 65) {
        $(ageid).addClass('is-invalid');
        $(ageid).click(function () {
            $(ageid).removeClass('is-invalid');
        });
        return false;
    }
    $(ageid).removeClass('is-invalid');
    $(ageid).addClass('is-valid');
    $(ageid).click(function () {
        $(ageid).removeClass('is-valid');
    });
    return true;
}

function validSelectors(selectorsids) {
    for (let i = 0; i < selectorsids.length; i++) {
        let id = selectorsids[i];
        let val = $(id).val();
        if (val === 'default') {
            $(id).addClass("is-invalid");
            $(id).click(function () {
                $(id).removeClass('is-invalid');
            });
            return false;
        }
    }
    return true;
}

function validAutoNum(id) {
    const sel2 = $("#" + id + "2");
    let val2 = sel2.val();
    const bol1 = validAutoLetter($("#" + id + "1"));
    const bol2 = validAutoLetter($("#" + id + "3"));
    if (val2 === "" || val2.length !== 4 || !(/^[0-9]+$/.test(val2))) {
        sel2.addClass("is-invalid");
        sel2.click(function () {
            sel2.removeClass('is-invalid');
        });
        return false;
    }
    return bol1 && bol2;
}

function validAutoLetter(sel) {
    const val = sel.val();
    if (val === "" || val.length !== 2 || !(/^[a-zA-ZА-Яа-яІ-і]+$/.test(val))) {
        sel.addClass("is-invalid");
        sel.click(function () {
            sel.removeClass('is-invalid');
        });
        return false;
    }
    sel.addClass("is-valid");
    sel.click(function () {
        sel.removeClass('is-valid');
    });
    return true;
}

function validEmptyAndSetKeyup(selector) {
    selector.keyup(function () {
        emailSelector.removeClass("is-valid");
        emailSelector.removeClass("is-invalid");
    });
    if (selector.val() === "") {
        selector.addClass("is-invalid");
        return false;
    }
    return true;
}