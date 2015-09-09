LS_KEY_UID      = 'local_storage_key_uid';
LS_KEY_PASSWORD = 'local_storage_key_password';

function loadSettings() {
    var uid, password;
    uid = localStorage[LS_KEY_UID];
    password = localStorage[LS_KEY_PASSWORD];

    if (uid != null) {
        $("#account").attr("value", uid);
    }
    if (password != null) {
        $("#password").attr("value", password);
    }
}
function saveSettings() {
    var uid, password;
    uid = $("#account").val();
    password = $("#password").val();

    localStorage[LS_KEY_UID] = uid;
    localStorage[LS_KEY_PASSWORD] = password;
}
window.onload = function () {
    $(document).ready(function() {
        $("#settings").hide();
        loadSettings();

        $("#text-settings").click(function () {
            $("#settings").show();
        })
        $("#btn-save-settings").click(function () {
            saveSettings();
            $("#settings").hide();
        })
    });
    $(document).keydown(function () {
        if (event.keyCode == 13) {
            $("#btn-save-settings").click();
            return false;
        }
    })
}