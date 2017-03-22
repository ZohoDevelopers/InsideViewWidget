Handlebars.registerHelper("log", function(param) {//No I18N
	var con=console;
		con.log(param);
});
Utils = {
};
/*
 * util methods
 */
Utils.showLoading = function(){
	$("#loadingDiv").show();
}
Utils.hideLoading = function(){
	$("#loadingDiv").hide();
}
Utils.successMsg = function(message){
	$('.successMsg').text(message);
	 $('.successMsg').slideDown(function() {
			$('.successMsg').delay(3000).slideUp();
			});
}
Utils.RenderTemplate=function(templateId , data,callBack){
	console.log(data);
	var template = $("#"+templateId).html();
	var compiledTemplate = Handlebars.compile(template);
	var widgetsDiv =$("#contentDiv");
	widgetsDiv.html(compiledTemplate(data));
	if(callBack)
	{
		callBack();
	}
};


APIHelper = {
		
};
APIHelper.get = function(url , data, callBack)
{
	return APIHelper.connect("GET", url, data,callBack);//no i18n
}
APIHelper.post = function(url , data, callBack)
{
	return APIHelper.connect("POST", url, data, callBack);//no i18n
}
APIHelper.connect = function(type , url , data,callBack)
{
	$.ajax({
		   type: type,//No I18N
		   url: url,
		   data:data,
		   success: function(data) {
			   callBack(data);
		   }
		});
}


InsideView=(function(){
	function getInfo(params,callBack)
	{
		ZOHO.CRM.CONFIG.getOrgVariable("nareshplugin4.InsideView_Auth").then(function(data){
			if(data && data.Success){

				var apiKey = data.Success.Content;

				var request ={
						url : "https://api.insideview.com/api/v1/enrich",
						params:params,
						headers:{
					 		accessToken:apiKey,
					 		"Content-Type":"application/x-www-form-urlencoded",
					 		Accept:"application/json",
						}
				}
				ZOHO.CRM.HTTP.post(request)
				.then(function(data){
					callBack(data)
				})
			}
		});
	};
	var requiredData ={
			contacts:["contactId","email","firstName","lastName","fullName","jobLevels","jobFunctions","titles"],
			company:["name","companyType","industry","companyStatus","street","city","state","country","zip","websites"]
	}
	return {
		updateView : function()
		{
			Utils.showLoading()
			ZOHO.CRM.INTERACTION.getPageInfo()
		    .then(function(data)
		    {
				var CrmData = data;
				console.data;
				var params = {};
				if(CrmData.Email){
					params.email = CrmData.Email;
				}
				if(CrmData.Company){
					params.companyName = CrmData.Company;
				}
				if(CrmData.website){
					params.website = CrmData.website;
				}
				if(Object.keys(params).length <= 0)
				{
					return;
				}
				getInfo(params,function(response){
					
					response = JSON.parse(response)
					var contactDetails = {};
					var companyDetails = {};
					var imageUrl = undefined;
					if(response)
					{
						var contact = response.contact;
						if(contact)
						{
							for (var index in requiredData.contacts)
							{
								var key =requiredData.contacts[index]; 
								if(contact[key])
								{
									contactDetails[key] =  contact[key];
									
								}
							}
							imageUrl = contact.imageUrl;
						}
						
						var company = response.company;
						if(company)
						{
							for (var index in requiredData.company) 
							{
								var key =requiredData.company[index]; 
								if(company[key])
								{
									companyDetails[key] =  company[key];
									
								}
							}
						}
						Utils.RenderTemplate("BusinessCard",{
							company : companyDetails,
							contact : contactDetails,
							imgUrl	: imageUrl || "https://drifting.media/wp-content/uploads/2016/11/default-05.png"
						},function(){
							if(Object.keys(contactDetails).length <= 0)
								{
									$("#Company").click();
								}
							Utils.hideLoading();
						});
					}
				})
			
		    })	
		},
		toggleView : function(obj){
			$(".bcView").hide();
			$(".bcTab").removeClass("sel");
			
			var id = $(obj).attr("id");
			$(obj).addClass("sel");
			$("#"+id+"View").show();
		}
	}
})();