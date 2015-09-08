SERVICE_SAP = "https://its.pku.edu.cn:5428/ipgatewayofpku";
LSKEY_UID = 'uid';
LSKEY_PASSWORD = "password";
LSKEY_STATE_TIME = 'state.time';
LSKEY_STATE_STATE = 'state.state';
LSKEY_STATE_USERNAME = 'state.username';
LSKEY_STATE_FIXRATE = 'state.fixrate';
LSKEY_STATE_IP = 'state.ip';
LSKEY_STATE_RANGE = 'state.range';
LSKEY_STATE_NCON = 'state.ncon';
LSKEY_STATE_FRTIME = 'state.frtime';
LSKEY_STATE_BALANCE = 'state.balance';
LSKEY_STATE_REASON = 'state.reason';
LSKEY_STATE_SUCCESS = 'state.success';

function showMessage(title,text){
     if (window.webkitNotifications.checkPermission() != 0) { // 0 is PERMISSION_ALLOWED
        window.webkitNotifications.requestPermission();
    }
	var notification = webkitNotifications.createNotification("images/logo48.png", title, text);
//    notification.replaceId = "connect_result";
    notification.ondisplay = function (event) {
        setTimeout(function () {
            event.currentTarget.cancel();
        }, 7 * 1000);
    };
    notification.show();
}

function isWeakPassword(username,password)
{
	if(username==password)return true;
	if(password.length<8)return true;
	var ch = password.charAt(0);
	var i = 1;
	for(;i<password.length;i++)
		if(password.charAt(i)!=ch)break;
	if(i==password.length)return true;
	return false;
}

//http://www.ajaxload.info/
function showLoading(text){
	$("#oLoading").show();
	$("#oMainView").attr('class',"transparent");
	$("#oUID").attr('disabled',true);
	$("#oPASSWORD").attr('disabled',true);
	$("#oRangeFree").attr('disabled',true);
	$("#oRangeFee").attr('disabled',true);
	$("#oRemeberAcc").attr('disabled',true);
	$("#oRemeberPw").attr('disabled',true);
	$("#oForget").off("click");
	$("#oConnect").attr('disabled',true);
	$("#oDisconn").attr('disabled',true);
	$("#oDiscall").attr('disabled',true);
	$("#oLoadingText").html(text);
}

function hideLoading(){
	$("#oLoading").hide();
	$("#oMainView").removeAttr('class');
	$("#oUID").attr('disabled',false);
	$("#oPASSWORD").attr('disabled',false);
	$("#oRangeFree").attr('disabled',false);
	$("#oRangeFee").attr('disabled',false);
	$("#oRemeberAcc").attr('disabled',false);
	$("#oRemeberPw").attr('disabled',false);
	$("#oForget").off("click");
	$("#oForget").click(clearCachedAccount);
	$("#oConnect").attr('disabled',false);
	$("#oDisconn").attr('disabled',false);
	$("#oDiscall").attr('disabled',false);
}

function loadState(){
	var resp = readState();
	loadCachedAccount();
	clearInfoPanel();
	$("#oTimeLabel").html(resp.timestamp);
	if(resp.state=="connected"){
		$("#oConstateLabel").html("已连接");
		$("#oUsernameLabel").html(resp.username);
		$("#oMontypeLabel").html(resp.fixrate);
		$("#oMoncreditLabel").html(resp.moncredit+"小时");
		$("#oRangeLabel").html((resp.iprange=="international")?"免费、收费地址":"免费地址");
		$("#oNconLabel").html(resp.ncon);
		$("#oBalanceLabel").html(resp.balance+"元");
		$("#oIPLabel").html(resp.ip);
	}else{
		$("#oConstateLabel").html("未连接");
	}
}

function parseResponse(resp){
	var jsonRet = {
		"success":"",
		"state":"",
		"username":"",
		"timestamp":"",
		"ip":"",
		"fixrate":"",
		"montype":"",
		"moncredit":"",
		"iprange":"",
		"ncon":"",
		"reason":""};
    idx_s = resp.indexOf("IPGWCLIENT_START");
	idx_e = resp.indexOf("IPGWCLIENT_END");
	if(idx_s >= idx_e)
	    return jsonRet;
	pairs = resp.substring(idx_s+16,idx_e).split(" ");
	for(var i=0;i<pairs.length;i++){
		pair = pairs[i].split("=");
		if(pair.length!=2)continue;
		else{
			if(pair[0]=="SUCCESS")jsonRet.success=pair[1];
			else if(pair[0]=="STATE")jsonRet.state=pair[1];
			else if(pair[0]=="USERNAME")jsonRet.username=pair[1];
			else if(pair[0]=="FIXRATE")jsonRet.fixrate=pair[1];
			else if(pair[0]=="FR_DESC_CN")jsonRet.montype=pair[1];
			else if(pair[0]=="FR_TIME")jsonRet.moncredit=pair[1];
			else if(pair[0]=="SCOPE")jsonRet.iprange=pair[1];
			else if(pair[0]=="CONNECTIONS")jsonRet.ncon=pair[1];
			else if(pair[0]=="BALANCE")jsonRet.balance=pair[1];
			else if(pair[0]=="IP")jsonRet.ip=pair[1];
			else if(pair[0]=="REASON")jsonRet.reason=pair[1];
		}
	}
	jsonRet.timestamp=new Date().toLocaleString();
	return jsonRet;
}

function writeState(jsonState){
	clearState();
	if(jsonState.timestamp!=undefined)localStorage.setItem(LSKEY_STATE_TIME,jsonState.timestamp);
	if(jsonState.state!=undefined)localStorage.setItem(LSKEY_STATE_STATE,jsonState.state);
	if(jsonState.username!=undefined)localStorage.setItem(LSKEY_STATE_USERNAME,jsonState.username);
	if(jsonState.fixrate!=undefined){
		if(jsonState.fixrate=="YES")
			localStorage.setItem(LSKEY_STATE_FIXRATE,jsonState.montype);
		else
			localStorage.setItem(LSKEY_STATE_FIXRATE,"未包月");
	}
	if(jsonState.moncredit!=undefined)localStorage.setItem(LSKEY_STATE_FRTIME,jsonState.moncredit);
	if(jsonState.iprange!=undefined)localStorage.setItem(LSKEY_STATE_RANGE,jsonState.iprange);
	if(jsonState.ncon!=undefined)localStorage.setItem(LSKEY_STATE_NCON,jsonState.ncon);
	if(jsonState.ip!=undefined)localStorage.setItem(LSKEY_STATE_IP,jsonState.ip);
	if(jsonState.balance!=undefined)localStorage.setItem(LSKEY_STATE_BALANCE,jsonState.balance);
	if(jsonState.reason!=undefined)localStorage.setItem(LSKEY_STATE_REASON,jsonState.reason);
	if(jsonState.success!=undefined)localStorage.setItem(LSKEY_STATE_SUCCESS,jsonState.success);
}

function readState(){
	var jsonState = {
		"success":"",
		"state":"",
		"username":"",
		"timestamp":"",
		"ip":"",
		"fixrate":"",
		"moncredit":"",
		"iprange":"",
		"balance":"",
		"ncon":"",
		"reason":""};
	t=localStorage.getItem(LSKEY_STATE_SUCCESS);if(t!=null)jsonState.success=t;
	t=localStorage.getItem(LSKEY_STATE_TIME);if(t!=null)jsonState.timestamp=t;
	t=localStorage.getItem(LSKEY_STATE_STATE);if(t!=null)jsonState.state=t;
	t=localStorage.getItem(LSKEY_STATE_USERNAME);if(t!=null)jsonState.username=t;
	t=localStorage.getItem(LSKEY_STATE_FIXRATE);if(t!=null)jsonState.fixrate=t;
	t=localStorage.getItem(LSKEY_STATE_FRTIME);if(t!=null)jsonState.moncredit=t;
	t=localStorage.getItem(LSKEY_STATE_RANGE);if(t!=null)jsonState.iprange=t;
	t=localStorage.getItem(LSKEY_STATE_IP);if(t!=null)jsonState.ip=t;
	t=localStorage.getItem(LSKEY_STATE_BALANCE);if(t!=null)jsonState.balance=t;
	t=localStorage.getItem(LSKEY_STATE_NCON);if(t!=null)jsonState.ncon=t;
	t=localStorage.getItem(LSKEY_STATE_REASON);if(t!=null)jsonState.reason=t;
	return jsonState;
}

function clearState(){
	localStorage.removeItem(LSKEY_STATE_SUCCESS);
	localStorage.removeItem(LSKEY_STATE_TIME);
	localStorage.removeItem(LSKEY_STATE_STATE);
	localStorage.removeItem(LSKEY_STATE_USERNAME);
	localStorage.removeItem(LSKEY_STATE_FIXRATE);
	localStorage.removeItem(LSKEY_STATE_RANGE);
	localStorage.removeItem(LSKEY_STATE_IP);
	localStorage.removeItem(LSKEY_STATE_REASON);
}

function clearInfoPanel(){
	$("#oTimeLabel").html("");
	$("#oUIDLabel").html("");
	$("#oConstateLabel").html("");
	$("#oUsernameLabel").html("");
	$("#oIPLabel").html("");
	$("#oRangeLabel").html("");
	$("#oNconLabel").html("");
	$("#oMontypeLabel").html("");
	$("#oMoncreditLabel").html("");
	$("#oBalanceLabel").html("");
}

function handleConnectResponse(resp){
	if(resp.success=="YES"){
		loadState();
	}else{
		showMessage("错误","连接失败，原因："+resp.reason);
	}
}

function connect(puid,ppassword,iprange,remacc,rempw){
    prange = "2";
    if(iprange == "fee")
	    prange = "1";
	bRet = false;	
	showLoading("正在连接...");
	$.ajax({
		type: "POST",
		url: SERVICE_SAP,
		data: { uid: puid,
			password: ppassword,
			range: prange,
			operation: "connect",
			timeout: "1"},
		dataType: "html",
		success: function(data,textStatus,jqXHR){
			resp = parseResponse(data)
			if(resp.success=="YES"){
				writeState(resp);
				if(remacc)localStorage.setItem(LSKEY_UID,puid);
				if(rempw)localStorage.setItem(LSKEY_PASSWORD,ppassword);
			}else{
				showMessage("连接失败",resp.reason);
			}
			bRet = handleConnectResponse(resp);
		},
		async: true
	}).error(function(){
		showMessage("断开连接失败","不能访问网关认证服务");
	}).always(hideLoading);
	return bRet;
}

function disconnect(){
    prange = "2";
	bRet = false;	
	showLoading("断开连接...");
	$.ajax({
		type: "POST",
		url: SERVICE_SAP,
		data: { uid: "",
			password: "",
			range: prange,
			operation: "disconnect",
			timeout: "1"},
		dataType: "html",
		success: function(data,textStatus,jqXHR){
			resp = parseResponse(data)
			if(resp.success=="YES"){
				clearState();
				localStorage.setItem(LSKEY_STATE_TIME,resp.timestamp)
				localStorage.setItem(LSKEY_STATE_SUCCESS,resp.success);
				localStorage.setItem(LSKEY_STATE_STATE,resp.state);
				loadState();
			}else{
				showMessage("断开连接失败",resp.reason);
			}
		},
		async: true
	}).error(function(){
		showMessage("断开连接失败","不能访问网关认证服务");
	}).always(hideLoading);
	return bRet;
}

function disconnectall(puid,ppassword){
	bRet = false;	
	showLoading("断开全部连接...");
	$.ajax({
		type: "POST",
		url: SERVICE_SAP,
		data: { uid: puid,
			password: ppassword,
			range: "4",
			operation: "disconnectall",
			timeout: "1"},
		dataType: "html",
		success: function(data,textStatus,jqXHR){
			resp = parseResponse(data)
			if(resp.success=="YES"){
				clearState();
				localStorage.setItem(LSKEY_STATE_TIME,resp.timestamp)
				localStorage.setItem(LSKEY_STATE_SUCCESS,resp.success);
				localStorage.setItem(LSKEY_STATE_STATE,resp.state);
				loadState();
			}else{
				showMessage("断开所有连接失败",resp.reason);
			}
		},
		async: true
	}).fail(function(jqXHR, textStatus, errorThrown) {
		showMessage("断开所有连接失败","不能访问网关认证服务："+errorThrown);
	}).always(hideLoading);
	return bRet;
}


function checkInput(){
	uid = $("#oUID").val();
	password = $("#oPASSWORD").val();
	ret = true;
	if(uid.length==0){
		ret = false;
		showMessage("错误","请输入用户名");
		$("#oUID").focus();
	}
	else if(password.length==0){
	    ret = false;
		showMessage("错误","请输入密码");
		$("#oPASSWORD").focus();
	}
	return ret;
}

function loadCachedAccount(){
	var uid = localStorage.getItem(LSKEY_UID);
	var password = localStorage.getItem(LSKEY_PASSWORD);
	if(uid!=null)$("#oUID").attr("value",uid);
	if(password!=null){
		$("#oPASSWORD").attr("value",password);
		$("#oRememberPw").attr("checked","checked");
	}
}

function clearCachedAccount(){
	localStorage.removeItem(LSKEY_UID);
	localStorage.removeItem(LSKEY_PASSWORD);
	showMessage("提醒","缓存的账号密码已经被清除");
}

window.onload=function(){
    $(document).ready(function(){
	    $("#oConnect").click(function (){
		    // 0 - check input
			if(!checkInput())return;
		    // 1 - get username and password
			uid = $("#oUID").val();
			password = $("#oPASSWORD").val();
			iprange = 'free';
			remacc = true;
			rempw = false;
			if($("#oRangeFee").prop("checked"))iprange='fee';
			if(!$("#oRememberAcc").prop("checked"))remacc=false;
			if($("#oRememberPw").prop("checked"))rempw=true;
			if(isWeakPassword(uid,password))
				showMessage("温馨提示","您的口令太简单，为保证您帐户安全，请登录https://its.pku.edu.cn修改密码");
			// 2 - send request
			connect(uid,password,iprange,remacc,rempw);
		})
	    $("#oDisconn").click(function (){
			disconnect();
		})
	    $("#oDiscall").click(function (){
			if(!checkInput())return;
			uid = $("#oUID").val();
			password = $("#oPASSWORD").val();
			disconnectall(uid,password);
		})
		$("#oForget").click(clearCachedAccount);
		//======================================
		loadState();
	    $("#oUID").focus();
		hideLoading();
    });
}



