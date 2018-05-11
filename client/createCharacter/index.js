var nameBlacklist = ["420", "69", "xx", "boi", "blaze"]
$(function(){
    var imageSelector = $("select[name=icon]");
    var nameInput = $("input[name=name]");
    var pwdInput = $("input[name=password]");
    for (var i = 1; i < 21; i++) {
        imageSelector.append('<option class="selectIcon" value="'+i+'" data-img-src="../res/img/classIconsSelected/Icon.'+ ((i < 10) ? "0" + i : i) +'.png"></option>')
    }
    imageSelector.imagepicker();
    $("div.button#reset").on("click",function(){
        nameInput.val("");
        pwdInput.val("");
    });
    connect("localhost:3000");
    $("div.button#submit").on("click", function(){
        var name = nameInput.val();
        var nameLower = name.toLowerCase();
        if(nameBlacklist.some(function(e){nameLower.includes(e)})){
            alert("You are bad, and should feel bad!");
            return;
        }
        var pwd = pwdInput.val();
        var icon = imageSelector.val();
        if(emit("createCharacter",{name: name, password: pwd, icon: icon})){
            window.location.href = "../chooseCharacter";
        } else {
            alert("error");
        }
    });
});
