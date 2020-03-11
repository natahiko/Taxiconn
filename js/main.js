function loginUser() {
    var login = $("#log_login").val();
    var pass = $("#log_pass").val();
    var type = $("#log_type").children("option:selected").val();
    if(type=='Оберіть як ви хочете увійти...'){
        return;
    } else if(type=='Клієнт'){
        type = "clients";
    } else if(type=='Водій'){
        type = "drivers";
    }
    $("#log_pass").val("");
    if(login=="" || pass==""){
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
            alert(data.data);
        },
        error: function (){
            alert("Перевірте правильність данних та спробуйте ще!");
        },
        data: JSON.stringify(person)
    });
}
