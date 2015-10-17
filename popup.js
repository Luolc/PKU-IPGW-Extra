SERVICE_SAP         = "https://its.pku.edu.cn:5428/ipgatewayofpku";
LS_KEY_UID          = 'local_storage_key_uid';
LS_KEY_PASSWORD     = 'local_storage_key_password';
LS_KEY_IS_REMEMBER  = 'local_storage_key_is_remember';
LS_KEY_IS_AUTO      = 'local_storage_key_is_auto';

function showNotification(title, message) {
    if (window.webkitNotifications.checkPermission() > 0) {
        window.webkitNotifications.requestPermission();
    }
    var notification = webkitNotifications.createNotification("images/PKU-IPGW-Extra-48.png", title, message);
    notification.ondisplay = function (event) {
        setTimeout(function () {
            event.currentTarget.cancel();
        }, 5000);
    };
    notification.show();
}

/**
 * Load local settings: uid, password, isRemember, isAuto
 */
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
    }
    if (isRemember != null && isRemember == "false") {
        $("#cb-remember").prop("checked", false);
    }
    if (isAuto != null && isAuto == "false") {
        $("#cb-auto").prop("checked", false);
    }
}

/**
 * Save local settings: uid, password, isRemember, isAuto
 */
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

/**
 * parse the response of the post for SERVICE_SAP
 * @param resp: the response of the post for SERVICE_SAP
 * @returns jsonObject of the response
 */
function parseResponse(resp){
    var jsonRet = {
        "success": "",
        "state": "",
        "username": "",
        "timestamp": "",
        "ip": "",
        "fixrate": "",
        "montype": "",
        "moncredit": "",
        "iprange": "",
        "ncon": "",
        "reason": ""
    };
    idx_s = resp.indexOf("IPGWCLIENT_START");
    idx_e = resp.indexOf("IPGWCLIENT_END");
    if (idx_s >= idx_e) {
        return jsonRet;
    }

    pairs = resp.substring(idx_s + 16, idx_e).split(" ");
    for (var i = 0; i < pairs.length; ++i) {
        pair = pairs[i].split("=");
        if (pair.length == 2) {
            if (pair[0] == "SUCCESS") {
                jsonRet.success = pair[1];
            } else if (pair[0] == "STATE") {
                jsonRet.state = pair[1];
            } else if(pair[0] == "USERNAME") {
                jsonRet.username = pair[1];
            } else if(pair[0] == "FIXRATE") {
                jsonRet.fixrate = pair[1];
            } else if(pair[0] == "FR_DESC_CN") {
                jsonRet.montype = pair[1];
            } else if(pair[0] == "FR_TIME") {
                jsonRet.moncredit = pair[1];
            } else if(pair[0] == "SCOPE") {
                jsonRet.iprange = pair[1];
            } else if(pair[0] == "CONNECTIONS") {
                jsonRet.ncon = pair[1];
            } else if(pair[0] == "BALANCE") {
                jsonRet.balance = pair[1];
            } else if(pair[0] == "IP") {
                jsonRet.ip = pair[1];
            } else if(pair[0] == "REASON") {
                jsonRet.reason = pair[1];
            }
        }
    }
    jsonRet.timestamp = new Date().toLocaleString();
    return jsonRet;
}

function updateConnectionState(resp) {
    $("#tx-uid").html(resp.username);
    $("#tx-state").html((resp.iprange == "international") ? "已连接到收费" : "已连接到免费");
    $("#tx-time").html(resp.moncredit + "小时");
    $("#tx-balance").html(resp.balance+"元");
}

function connect(uid, password, ipRange) {
    ipRange = ipRange == "fee" ? "1" : "2";
    $.ajax({
        type: "POST",
        url: SERVICE_SAP,
        data: {
            uid: uid,
            password: password,
            range: ipRange,
            operation: "connect",
            timeout: "-1"
        },
        dataType: "html",
        success: function (response, textStatus, XMLHttpRequest) {
            response = parseResponse(response);
            if (response.success == "YES") {
                updateConnectionState(response);
            } else {
                alert(response.reason);
                showNotification("连接失败", response.reason);
            }
        },
        async: true
    }).error(function () {
        showNotification("断开连接失败", "不能访问网关认证服务");
    });
}

function disconnect(){
    ipRange = "2";
    $.ajax({
        type: "POST",
        url: SERVICE_SAP,
        data: {
            uid: "",
            password: "",
            range: ipRange,
            operation: "disconnect",
            timeout: "-1"
        },
        dataType: "html",
        success: function(response, textStatus, XMLHttpRequest) {
            response = parseResponse(response);
            if (response.success == "YES") {
                $("#tx-state").html("未连接");
                $("#tx-time").html("");
                $("#tx-balance").html("");
            } else {
                showNotification("断开连接失败", response.reason);
            }
        },
        async: true
    }).error(function(){
        showNotification("断开连接失败", "不能访问网关认证服务");
    });
}

function disconnectall(uid,password){
    $.ajax({
        type: "POST",
        url: SERVICE_SAP,
        data: {
            uid: uid,
            password: password,
            range: "4",
            operation: "disconnectall",
            timeout: "-1"
        },
        dataType: "html",
        success: function(response, textStatus, XMLHttpRequest) {
            response = parseResponse(response);
            if (response.success=="YES") {
                $("#tx-state").html("未连接");
                $("#tx-time").html("");
                $("#tx-balance").html("");
            } else {
                showNotification("断开所有连接失败", response.reason);
            }
        },
        async: true
    }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
        showNotification("断开所有连接失败", "不能访问网关认证服务：" + errorThrown);
    });
}

function initConnectionState() {
    uid = localStorage[LS_KEY_UID];
    if (uid != null) {
        $("#tx-uid").html(uid);
    }
    $("#tx-state").html("未知");
    $.ajax({
        type: "GET",
        url: "http://www.sublimetext.com/2",
        timeout: 200,
        success: function() {
            $("#tx-state").html("已连接到收费");
        }
    }).error(function () {
        $.ajax({
            type: "GET",
            url: "https://www.baidu.com/",
            timeout: 200,
            success: function() {
                $("#tx-state").html("已连接到免费");
            }
        }).error(function () {
            $("#tx-state").html("未连接");
        });
    });
    $("#tx-time").html("");
    $("#tx-balance").html("");
}
/**
 * main
 */
window.onload = function () {
    var isSettingsVisible;
    $(document).ready(function() {
        initConnectionState();
        $("#settings").hide();
        loadSettings();
        isSettingsVisible = false;

        $("#btn-connect-free").click(function () {
            var uid, password, ipRange;
            uid = localStorage[LS_KEY_UID];
            password = localStorage[LS_KEY_PASSWORD];
            ipRange = "free";
            connect(uid, password, ipRange);
        });
        $("#btn-connect-fee").click(function () {
            var uid, password, ipRange;
            uid = localStorage[LS_KEY_UID];
            password = localStorage[LS_KEY_PASSWORD];
            ipRange = "fee";
            connect(uid, password, ipRange);
        });
        $("#btn-disconnect-this").click(function () {
            disconnect();
        });
        $("#btn-disconnect-all").click(function () {
            var uid, password, ipRange;
            uid = localStorage[LS_KEY_UID];
            password = localStorage[LS_KEY_PASSWORD];
            disconnectall(uid, password);
        });
        $("#text-settings").click(function () {
            if (isSettingsVisible) {
                $("#settings").hide();
            } else {
                $("#settings").show();
            }
            isSettingsVisible = !isSettingsVisible;
        });
        $("#btn-save-settings").click(function () {
            saveSettings();
            $("#settings").hide();
            isSettingsVisible = false;
        });
    });
    $(document).keydown(function () {
        if (event.keyCode == 13) {
            $("#btn-save-settings").click();
            return false;
        }
    });
}