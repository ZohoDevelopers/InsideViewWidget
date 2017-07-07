const Const={
		conf:{
				serverUrl:"https://udhaya-4387",
				updatePageURL:"/office/insideview/newinside/InsideViewWidget/WebContent/html/updateDetails.html"
		},
		orgVariable:{
			apiKey:"insideview5.oauthtoken",
			mappingFields:"insideview5.fieldmapping"
		}
}

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
	var template = $("#"+templateId).html();
	var compiledTemplate = Handlebars.compile(template);
	var widgetsDiv =$("#contentDiv");
	widgetsDiv.html(compiledTemplate(data));
	if(callBack)
	{
		callBack();
	}
};
var mappgingDetails;
var ivcompany;
var ivcontact;
var insideviewApiFlds={};
var insideViewLabels=["Company","First Name","Last Name","Title","Email","Website","Street","City","State","Zip Code","Country"];
var insideViewapilabels=["name","firstName","lastName","titles","email","websites","street","city","state","zip","country"];
var currentRecord;
var Storedleadlabel;
var StoredContactlabel;
var moduledetails = {};
for(index in insideViewLabels)
{
	var key = insideViewLabels[index];
	insideviewApiFlds[key] = insideViewapilabels[index];
}

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
		ZOHO.CRM.CONFIG.getOrgVariable(Const.orgVariable.apiKey).then(function(data){
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
			ZOHO.CRM.CONFIG.getOrgVariable(Const.orgVariable.mappingFields).then(function(data){
				mappgingDetails = data.Success.Content;
			});

			ZOHO.CRM.META.API.getFields({"Entity":"Leads"}).then(function(data){
				console.log(data);	
				Storedleadlabel = data;

			});
			ZOHO.CRM.META.API.getFields({"Entity":"Contacts"}).then(function(data){
				console.log(data);	
				StoredContactlabel = data;

			});

			//Utils.showLoading()
			ZOHO.CRM.INTERACTION.getPageInfo()
			.then(function(data)
					{
				var CrmData = data.data;
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
						ivcontact = contactDetails;
						ivcompany = companyDetails;
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
function mappingFields(){		

	var lfieldnames = [];
	var cfieldnames =[];

	ZOHO.CRM.META.API.getFields({"Entity":"Leads"}).then(function(data){
		var resp = data;
		for(i in resp.fields)
		{
			var field = resp.fields[i] ; 
			if(field.data_type!="lookup" && field.data_type!="ownerlookup" && field.data_type!="picklist" && field.data_type!="datetime")
			{
				lfieldnames.push(resp.fields[i].field_label);
			}
		}
		return ZOHO.CRM.META.API.getFields({"Entity":"Contacts"})
	}).then(function(data){
		var resp =data;
		for(i in resp.fields)
		{
			var field = resp.fields[i] ; 
			if(field.data_type!="lookup" && field.data_type!="ownerlookup" && field.data_type!="picklist" && field.data_type!="datetime")
			{
				cfieldnames.push(resp.fields[i].field_label);
			}
		}
	}).then(function(){
		Utils.RenderTemplate("Fieldsmapping",{
			leadslabels:lfieldnames,
			ivlabels:insideViewLabels,
			contactslabels: cfieldnames
			});
		return ZOHO.CRM.CONFIG.getOrgVariable(Const.orgVariable.mappingFields);
	}).then(function(data){
		var savedmapping ={};
		savedmapping = JSON.parse(data.Success.Content);
		$(".fieldrow").each(function(){
			var label = $(this).find(".ivlabel").text();
			if(savedmapping[""+label+""].overwrite=="true")
			{
				$(this).find(".overwrite").attr("checked","checked");
				$(this).find(".overwrite").val("true");
				$(this).find(".overwritelabel").removeClass("unchecked");
				$(this).find(".overwritelabel").addClass("checked");
			}
			else if(savedmapping[""+label+""].overwrite=="false")
			{
				$(this).find("overwrite").val("false");
				$(this).find(".overwritelabel").removeClass("checked");
				$(this).find(".overwritelabel").addClass("unchecked");
			}
			//$(this).find(".overwrite")
			$($(this).find("#leadfields option")).each(function(){
				var currentopton = $(this).val();
				if(currentopton==savedmapping[""+label+""].Lead)
				{
					$(this).attr("selected","selected");
				}
			});	
			$($(this).find("#contactfields option")).each(function(){
				var currentopton = $(this).val();
				if(currentopton==savedmapping[""+label+""].Contact)
				{
					$(this).attr("selected","selected");
				}
			});			

		});
		Utils.hideLoading();
	});
}
function checkoverwrite(obj)
{
	if($(obj).hasClass("checked"))
	{
		$(obj).removeClass("checked");
		$(obj).addClass("unchecked");
	}
	else
	{
		$(obj).addClass("checked");
		$(obj).removeClass("unchecked");
	}

}
function openpopup()
{
	ZOHO.CRM.INTERACTION.getPageInfo().then(function(data){
		moduledetails["leadid"] = data.data.id;
		moduledetails["module"] = data.entity;
		currentRecord = data.data;
		var mappingobject = JSON.parse(mappgingDetails);
		var storedLeadfields = Storedleadlabel.fields;
		var storedContactFields = StoredContactlabel.fields;
		var Entitytype = moduledetails["module"];
		var allUpdateDetails = [];
		console.log(mappingobject);
		/* Fetch Lead Details starts here */
		if(Entitytype=="Leads")
		{
			for(li in mappingobject)
			{
				var temp = {};
				var predefinedLabel = li;
				//console.log(crmlabel);
				var insideviewlabel = insideviewApiFlds[predefinedLabel];
				temp["crmlabel"] = mappingobject[li].Lead;
				//console.log(insideviewlabel);
				for(lj in storedLeadfields)
				{
					if(storedLeadfields[lj].field_label==mappingobject[li].Lead)
					{
						temp["crmapiname"] = storedLeadfields[lj].api_name;
						temp["crmcurrentvalue"] = currentRecord[storedLeadfields[lj].api_name];

						console.log(storedLeadfields[lj].api_name);
					}
				}
				if(ivcontact[insideviewlabel]!=undefined)
				{	
					temp["insidevalue"] = ivcontact[insideviewlabel];
				}
				else if(ivcompany[insideviewlabel]!=undefined)
				{
					temp["insidevalue"] = ivcompany[insideviewlabel];
				}
				temp["overwrite"] = mappingobject[li].overwrite;
				allUpdateDetails.push(temp);		
			}
		}
		/* Fetch Leads Details Ends here    */


		/* Fetch Contact Details  starts here  */
		else if(Entitytype=="Contacts")
		{
			for(ci in mappingobject)
			{
				var temp = {};
				var crmlabel = mappingobject[ci].Contact;
				var crmleadlabel = ci;
				//console.log(crmlabel);
				var insideviewlabel = insideviewApiFlds[crmleadlabel];
				temp["crmlabel"] = crmlabel;
				//console.log(insideviewlabel);
				for(cj in storedContactFields)
				{
					if(storedContactFields[cj].field_label==crmlabel)
					{
						temp["crmapiname"] = storedContactFields[cj].api_name;
						temp["crmcurrentvalue"] = currentRecord[storedContactFields[cj].api_name];

						console.log(storedContactFields[cj].api_name);
					}
				}
				if(ivcontact[insideviewlabel]!=undefined)
				{	
					temp["insidevalue"] = ivcontact[insideviewlabel];
				}
				else if(ivcompany[insideviewlabel]!=undefined)
				{
					temp["insidevalue"] = ivcompany[insideviewlabel];
				}
				temp["overwrite"] = mappingobject[ci].overwrite;
				allUpdateDetails.push(temp);		
			}
		}
		console.log(allUpdateDetails);
		console.log(moduledetails);
		/*  Fetch Contact Details Ends here   */


		var openwindow = window.open(Const.conf.serverUrl+Const.conf.updatePageURL,"_blank","width=1000px,height=700px,left=500px,top=100px");	
		openwindow.onload = function(){
			//openwindow.postMessage({"ivcontact":ivcontact,"ivcompany":ivcompany,"mappingDetails":JSON.parse(mappgingDetails),"storedleadlabel":Storedleadlabel,"insideviewApiFlds":insideviewApiFlds,"currentRecordDetails":currentRecord},"*");
			openwindow.postMessage({"allupdateInfo":allUpdateDetails,"moduledetails":moduledetails},"*");

		}
	});

}
function toggleOverwrite(obj){
	var overwriteValue = $(obj).val();
	//console.log(overwriteValue);
	var ischecked = $(obj).attr("checked");
	if(overwriteValue=="false")
	{
		$(obj).val("true");
	}
	else if(overwriteValue=="true")
	{
		$(obj).val("false");
	}

}
function save(){
	var fieldWithMapping={};
	$(".fieldrow").each(function(){
		var ivFld =$(this).find(".ivcolumn").text();
		var leadFld =$(this).find(".leadcolumn select option:selected").val();
		var contactFld =$(this).find(".contactcolumn select option:selected").val();
		var overwrite =$(this).find(".overwrite").val();

		fieldWithMapping[ivFld]={"Lead":leadFld,"Contact":contactFld,"overwrite":overwrite};


	})
	var mappingInfo = JSON.stringify(fieldWithMapping);
	var variableMap = {"apiname":Const.orgVariable.mappingFields,"value":mappingInfo};
	ZOHO.CRM.CONNECTOR.invokeAPI("crm.set",variableMap).then(function(data){
		console.log(data)
		$('.success').slideDown(function() {
			$('.success').delay(3000).slideUp();
		});
	})
	console.log(fieldWithMapping);
}
function getInfo(params,callBack)
	{
		ZOHO.CRM.CONFIG.getOrgVariable(Const.orgVariable.apiKey).then(function(data){
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

function insideViewPostRequest(url,authtoken,params,callBack){
	var request ={
			url :url,
			params:params,
			headers:{
				accessToken:authtoken,
				"Content-Type":"application/x-www-form-urlencoded",
				Accept:"application/json",
			}
	}
	return ZOHO.CRM.HTTP.post(request)
}
function insideViewGetRequest(url,authtoken,params){
	var request ={
			url :url,
			params:params,
			headers:{
				accessToken:authtoken,
				"Content-Type":"application/x-www-form-urlencoded",
				Accept:"application/json",
			}
	}
	return ZOHO.CRM.HTTP.get(request)
	.then(function(response){
		return JSON.parse(response);
	});
}

function getContactDetails(){
	dataObj = {
		orgInfo : undefined,
		pageInfo:undefined

	}
	Utils.showLoading();
	ZOHO.CRM.CONFIG.getOrgVariable(Const.orgVariable.apiKey)
	.then(function(orgVariableResp){
		dataObj.orgInfo = orgVariableResp;
	})
	.then(ZOHO.CRM.INTERACTION.getPageInfo)
	.then(function(pageInfoResponse){
		dataObj.pageInfo = pageInfoResponse;	
	})
	.then(function(){
		if(dataObj.orgInfo && dataObj.orgInfo.Success)
		{
			var apiKey = dataObj.orgInfo.Success.Content;
			var accountName = dataObj.pageInfo.data.Account_Name;
			var url="https://api.insideview.com/api/v1/target/contacts";
			return insideViewPostRequest(url,apiKey,{companyName:accountName})
		 }
	})
	.then(function(response){
		var resp =  JSON.parse(response);
		var contactsJson = resp.contacts;
		var apiKey = dataObj.orgInfo.Success.Content;
		var allContactsInfo = [];
		for(i in contactsJson)
		{
			var peopleUrl = "https://api.insideview.com/api/v1/people/"+contactsJson[i].peopleId;
			allContactsInfo.push(insideViewGetRequest(peopleUrl,apiKey,{}));
		}
		
		return Promise.all(allContactsInfo);
	})
	.then(function(contactsInfoArray){
		var AllContactDetails = [];
		for(i in contactsInfoArray){
			var temp = {};
			temp["First Name"] = contactsInfoArray[i].firstName;
			temp["Last Name"] = contactsInfoArray[i].lastName;
			if(contactsInfoArray[i].twitterHandle)
			{
				temp["Twitter"] = contactsInfoArray[i].twitterHandle;
			}
			if(contactsInfoArray[i].employments[0] !=undefined)
			{
				temp["Title"] = contactsInfoArray[i].employments[0].titles[0];
				temp["Email"] = contactsInfoArray[i].employments[0].email;
				temp["Department"] = contactsInfoArray[i].employments[0].companyName;
				temp["Description"] = contactsInfoArray[i].employments[0].description;
			}	
    		AllContactDetails.push(temp);
			
		}
		return Promise.all(AllContactDetails)
	})
	.then(function(newContactDetails){
		console.log(newContactDetails);
		Utils.RenderTemplate("companyContacts",{"contacts":newContactDetails},function(){
			Utils.hideLoading();
		});
	});
}

function getUnSavedContacts(unSaveddata){
	return ZOHO.CRM.API.searchRecord({Entity:"Contacts",Type:"criteria",Query:"((Last_Name:equals:"+unSaveddata["Last Name"]+") and (Title:equals:"+unSaveddata["Title"]+"))"})
	.then(function(data){
    	if(data.statusText)
    	{
    		return unSaveddata;
    	}
    	else
    	{
    		return undefined;
    	}
	})
}

function InsertContact(obj){
	var FirstName = $(obj).closest("tr").find(".firstName").text().trim();
	var LastName = $(obj).closest("tr").find(".lastName").text().trim();
	var Email = $(obj).closest("tr").find(".email").text().trim();
	var Department = $(obj).closest("tr").find(".department").text().trim();
	var Title = $(obj).closest("tr").find(".title").text().trim();

	//twitter user name
	var Twitter = $(obj).closest("tr").find(".twitter").text().trim();
	var regex = /http:\/\/twitter.com\/(.*)/g;
	if(Twitter!="" && Twitter!=undefined)
	{
		Twitter = regex.exec(Twitter)[1];
	}
	var btn = $(obj).closest("tr").find(".blueBtn");
	var recordData = {
		"First_Name" : FirstName,
		"Last_Name" : LastName,
		"Email" : Email,
		"Title" : Title,
		"Department" : Department,
		"Twitter" : Twitter
	}
	//console.log(recordData);
	ZOHO.CRM.API.searchRecord({Entity:"Contacts",Type:"criteria",Query:"((Last_Name:equals:"+LastName+") and (Title:equals:"+Title+"))"})
	.then(function(searchResult){
		console.log(searchResult);
		if(searchResult.statusText)
		{
			ZOHO.CRM.API.insertRecord({Entity:"Contacts",APIData:recordData})
			.then(function(insertStatus){
				console.log(insertStatus)
				if(insertStatus[0].status=="success")
				{
					btn.removeClass("blueBtn");
					btn.addClass("successBtn");
					btn.attr("onclick","");
					btn.val("Added");
				}
			});
		}
		else
		{
			alert("Record already exist.")
		}
	});
}

function getInsideviewDatas(data){
	Utils.showLoading();
var CrmData = data.Data;
var params = {};
var Entitytype = data.Entity;
var mappingobject;
var storedLeadfields;
var storedContactFields;
var allUpdateDetails = {};
var requiredData ={
		contacts:["contactId","email","firstName","lastName","fullName","jobLevels","jobFunctions","titles"],
		company:["name","companyType","industry","companyStatus","street","city","state","country","zip","websites"]
	}



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
		Utils.hideLoading();
		var noInputs = "Please fill anyone of fields (Email,company,Website) to fetch the data from insideview";
		$(".statusMsg").html(noInputs);
		setTimeout(function(){
			ZOHO.CRM.UI.Popup.close();
		},3000);
		return;
	}
	getInfo(params,function(resp){
		response = JSON.parse(resp)
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
			ivcontact = contactDetails;
			ivcompany = companyDetails;	
		}
	});	





	ZOHO.CRM.CONFIG.getOrgVariable(Const.orgVariable.mappingFields).then(function(mapping){
		mappgingDetails = mapping.Success.Content;
		mappingobject = JSON.parse(mappgingDetails);











		ZOHO.CRM.META.API.getFields({"Entity":"Leads"}).then(function(leadfields){
			storedLeadfields = leadfields.fields;
			ZOHO.CRM.META.API.getFields({"Entity":"Contacts"}).then(function(contactfields){
				storedContactFields = contactfields.fields;
				if(Entitytype=="Leads")
				{
					for(li in mappingobject)
					{
						var predefinedLabel = li;
						var insideviewlabel = insideviewApiFlds[predefinedLabel];
						for(lj in storedLeadfields)
						{
							if(storedLeadfields[lj].field_label==mappingobject[li].Lead)
							{
								if(ivcontact[insideviewlabel])
								{	
									allUpdateDetails[storedLeadfields[lj].api_name] = ivcontact[insideviewlabel];
								}
								else if(ivcompany[insideviewlabel])
								{
									allUpdateDetails[storedLeadfields[lj].api_name] = ivcompany[insideviewlabel];
								}
							}
						}					
					}
					ZOHO.CRM.UI.Record.populate(allUpdateDetails).then(function(data){
					    if(data==true)
					    {
					    	$(".statusMsg").html("InsideView Data is updated!.");
					    	Utils.hideLoading();
					    	setTimeout(function(){
								ZOHO.CRM.UI.Popup.close();
							},1000);
					    }
					    else
					    {
					    	$(".statusMsg").html("No Datas available in insideview as per your data.");
					    }
					})
				}
				else if(Entitytype=="Contacts")
				{
					for(ci in mappingobject)
					{
						var crmlabel = mappingobject[ci].Contact;
						var crmleadlabel = ci;
						var insideviewlabel = insideviewApiFlds[crmleadlabel];
						for(cj in storedContactFields)
						{
							if(storedContactFields[cj].field_label==crmlabel)
							{
								if(ivcontact[insideviewlabel])
								{	
									allUpdateDetails[storedContactFields[cj].api_name] = ivcontact[insideviewlabel];
								}
								else if(ivcompany[insideviewlabel])
								{
									allUpdateDetails[storedContactFields[cj].api_name] = ivcompany[insideviewlabel];
								}
							}
						}
					}
					ZOHO.CRM.UI.Record.populate(allUpdateDetails).then(function(data){
					    if(data==true)
					    {
					    	$(".statusMsg").html("InsideView Data is updated!.");
					    	Utils.hideLoading();
					    	setTimeout(function(){
								ZOHO.CRM.UI.Popup.close();
							},1000);
					    }
					    else
					    {
					    	$(".statusMsg").html("No Datas available in insideview as per your data.");
					    }
					})
				}

			});
		});
	});	
}

Handlebars.registerHelper("ifEquals", function(v1,v2,options){
	if(v1===v2)
	{
		return options.fn(this);
	}
	else
	{
		return options.inverse(this);
	}
})

Handlebars.registerHelper("ifEqualsmodule",function(v1,v2,options){
	if(v1==v2)
	{
		return options.fn(this);
	}
	else
	{
		return options.inverse(this);
	}
});
