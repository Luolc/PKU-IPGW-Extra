SERVICE_SAP         = "https://its.pku.edu.cn:5428/ipgatewayofpku";
LS_KEY_UID          = 'local_storage_key_uid';
LS_KEY_PASSWORD     = 'local_storage_key_password';
LS_KEY_IS_REMEMBER  = 'local_storage_key_is_remember';
LS_KEY_IS_AUTO      = 'local_storage_key_is_auto';

function loadSettings() {
    var uid, password, isRemember, isAuto;
    uid = localStorage[LS_KEY_UID];
    password = localStorage[LS_KEY_PASSWORD];
    isRemember = localStorage[LS_KEY_IS_REMEMBER];
    isAuto = localStorage[LS_KEY_IS_AUTO];
   
    if (isRemember != null && isRemember == "true") {       
        if (uid != null) {
            $("#account").attr("value", uid);
        }
        if (password != null) {
            $("#password").attr("value", password);
        }
    } else {
        $("#cb-remember").prop("checked", false);
    }
    if (isAuto != null && isAuto == "false") {
        $("#cb-auto").prop("checked", false);
    }
}
function saveSettings() {
    var uid, password, isRemember, isAuto;
    uid = $("#account").val();
    password = $("#password").val();
    isRemember = true;
    isAuto = true;
    if (!$("#cb-remember").prop("checked")) {
        isRemember = false;
    }
    if (!$("#cb-auto").prop("checked")) {
        isAuto = false;
    }

    localStorage[LS_KEY_UID] = uid;
    localStorage[LS_KEY_PASSWORD] = password;
    localStorage[LS_KEY_IS_REMEMBER] = isRemember;
    localStorage[LS_KEY_IS_AUTO] = isAuto;
}
function connect(uid, password, ipRange) {
    ipRange = ipRange == "fee" ? "1" : "2";
    //bRet = false;
    //showLoading("正在连接...");
    $.ajax({
        type: "POST",
        url: SERVICE_SAP,
        data: {
            uid: uid,
            password: password,
            range: ipRange,
            operation: "connect",
            timeout: "1"
        },
        dataType: "html",
        success: function (data, textStatus, XMLHttpRequest) {
            resp = parseResponse(data);
            if (resp.success == "YES") {
                writeState(resp);
                if (remacc) localStorage.setItem(LSKEY_UID, puid);
                if (rempw) localStorage.setItem(LSKEY_PASSWORD, ppassword);
            } else {
                showMessage("连接失败", resp.reason);
            }
            bRet = handleConnectResponse(resp);
        },
        async: true
    }).error(function () {
        showMessage("断开连接失败", "不能访问网关认证服务");
    }).always(hideLoading);
    return bRet;
}
window.onload = function () {
    $(document).ready(function() {
        $("#settings").hide();
        loadSettings();

        $("#btn-connect-free").click(function () {

        })
        $("#btn-connect-fee").click(function () {

        })
        $("#btn-disconnect-this").click(function () {

        })
        $("#btn-disconnect-all").click(function () {

        })
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