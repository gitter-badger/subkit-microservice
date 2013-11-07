var swagger = require('swagger-doc');
module.exports.configure = function(server, options){
	swagger.configure(server, options);

	var manage_doc = swagger.createResource("/docs/manage", {description: "Manage operation"});
	manage_doc.description = "Management operation";
	manage_doc.post("/manage/login","Login with username and password.",{
		nickname: "Login",
	    summary: "Validate username and password.",
	    "errorResponses":[
			{
				"code": 401,
				"reason": "Unauthorized request."
			}
		]
	});
	manage_doc.put("/manage/change","Change API key.",{
		nickname: "ChangeAPIKey",
	    summary: "Change the current API key to a new uuid.",
	    "errorResponses":[
			{
				"code": 401,
				"reason": "Unauthorized request."
			}
		]
	});


	var stores_doc = swagger.createResource("/docs/stores",  {description: "Store operations"});
	stores_doc.models.Info = {
		id: "Info",
		properties: {
			grant:{
				type: "bool"
			},
			name:{
				type: "string"
			}
		}
	};
	stores_doc.get("/stores", "Gets all stores", {
		nickname: "ReadStores",
		responseClass: "List[Info]",
		"errorResponses":[
			{
				"code": 401,
				"reason": "Unauthorized request."
			}
		]
	});
	var mr_doc = swagger.createResource("/docs/run",  {description: "Run task operations"});
	mr_doc.models.Value = {
		id: "Value",
		properties: {}
	};
	mr_doc.get("/run/schema", "Load JSON schema for specified store name.", {
	    nickname: "getSchema",
		responseClass: "Value",
		parameters: [
			{name: "store", description: "Store name", required:true, dataType: "string", paramType: "query"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	mr_doc.get("/run/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	mr_doc.post("/run/{name}", "Execute task script by name.", {
	    nickname: "run",
	    responseClass: "Value",
		parameters: [
			{name: "name", description: "Script name.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", allowMultiple:true, required:true, dataType: "Value", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});

	var store_doc = swagger.createResource("/docs/store",  {description: "Store operations"});
	store_doc.models.Value = {
		id: "Value",
		properties: {}
	};

	store_doc.get("/store/{name}", "Read all items by store name.", {
	    nickname: "FindAll",
		responseClass: "List[Value]",
	    parameters: [
	    	{name: "name", description: "Start letters of name of store.", required:true, dataType: "string", paramType: "path"},
	    	{name: "keysOnly", description: "Only get the keys.(default: false)", required:false, dataType: "boolean", paramType: "query"},
	    	{name: "cache", description: "Disable storage level caching. (default: true)", required:false, dataType: "boolean", paramType: "query"},
			{name: "from", description: "Start from a specified item key. (default:'')", required:false, dataType: "string", paramType: "query"},
			{name: "limit", description: "Limit results within numeric number. (default: -1)", required:false, dataType: "int", paramType: "query"},
	    ],
	    "errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});

	store_doc.get("/store/{name}/{key}", "Gets an item in store.", {
	    nickname: "Find",
		responseClass: "Value",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});

	store_doc.post('/store/{name}/{key}', "Create an item in store.", {
		nickname: "Create",
		responseClass: "void",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", required:true, dataType: "Value", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});

	store_doc.put('/store/{name}/{key}', "Update an item in store.", {
		nickname: "Update",
		responseClass: "void",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "Item object.", required:true, dataType: "Value", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});

	store_doc.delete('/store/{name}/{key}', "Delete an item in store.", {
		nickname: "Delete",
		responseClass: "void",
		parameters: [
			{name: "name", description: "Name of store.", required:true, dataType: "string", paramType: "path"},
			{name: "key", description: "Item key.", required:true, dataType: "string", paramType: "path"}
			
		],
    	"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});
	store_doc.post("/store/{name}/grant", "Grant public access to a store.", {
		nickname: "Grant",
		responseClass: "void",
		parameters: [
        	{name:"name", description: "Name of store.", required:true, dataType: "string", paramType: "path"}
    	],
    	"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});

	store_doc.delete("/store/{name}/grant", "Revoke public access to a store.", {
		nickname: "Revoke",
		responseClass: "void",
	    parameters: [
        	{name:"name", description: "Name of store.", required:true, dataType: "string", paramType: "path"}
    	],
    	"errorResponses":[
			{
				"code": 400,
				"reason": "Invalid parameter format."
			},
			{
				"code": 401,
				"reason": "Unauthorized request."
			},
			{
				"code": 404,
				"reason": "Invalid parameter format."
			}
		]
	});

	var subscribe_doc = swagger.createResource("/docs/subscribe",  {description: "Subscribe to a channel."});
	subscribe_doc.get("/subscribe/{channel}/{clientId}", "Long-Polling Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	subscribe_doc.post("/subscribe/{channel}/{clientId}", "Subscribe to specified channel with a client id.", {
	    nickname: "subscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	subscribe_doc.delete("/subscribe/{channel}/{clientId}", "Unsubscribe from specified channel with a client id.", {
	    nickname: "unsubscribe",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "Your client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});

	var channels_doc = swagger.createResource("/docs/channels",  {description: "Channels for message distribution."});
	channels_doc.models.Info = {
		id: "Info",
		properties: {
			channel:{
				type: "string"
			}
		}
	};
	channels_doc.get("/channels", "Get all available channels.", {
	    nickname: "getChannels",
		responseClass: "List[Info]",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	channels_doc.get("/channels/{clientId}", "Get all channels by client Id.", {
	    nickname: "getChannelsByClientId",
		responseClass: "List[Info]",
		parameters: [
			{name: "clientId", description: "Client Id.", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	
	var channel_doc = swagger.createResource("/docs/channel",  {description: "Channel for message distribution."});
	channel_doc.post("/channel/publish/{channel}", "Publish message to specified channel.", {
	    nickname: "publish",
		parameters: [
			{name: "channel", description: "Channel name", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});

	var clients_doc = swagger.createResource("/docs/clients",  {description: "Clients for message distribution."});
	clients_doc.models.Info = {
		id: "Info",
		properties: {
			clientId:{
				type: "string"
			},
			channel:{
				type: "string"
			}
		}
	};
	clients_doc.get("/clients", "Get all available clients.", {
	    nickname: "getClients",
		responseClass: "List[Info]",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	clients_doc.get("/clients/{channel}", "Get all clients by channel name.", {
	    nickname: "getClientsByChannel",
		responseClass: "List[Info]",
		parameters: [
			{name: "channel", description: "Channel name.", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	
	var client_doc = swagger.createResource("/docs/client",  {description: "Client for message distribution."});
	client_doc.models.Value = {
		id: "Value",
		properties: {
		    clientId: {
		    	type: "string"
		    },
		    channel:{
		    	type: "string"
		    },
		    data: {
		    }
  		}
	};
	client_doc.get("/client/{channel}/{clientId}", "Receive messages from specified stream and client id.", {
	    nickname: "receive",
		responseClass: "List[Value]",
		parameters: [
			{name: "channel", description: "channel name", required:true, dataType: "string", paramType: "path"},
			{name: "clientId", description: "client id", required:true, dataType: "string", paramType: "path"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	client_doc.get("/client/{clientId}", "Receive all messages for client id.", {
	    nickname: "receiveAll",
		responseClass: "List[Value]",
		parameters: [
			{name: "clientId", description: "client id", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	client_doc.post("/client/publish/{clientId}", "Publish message to specified client id.", {
	    nickname: "publish",
		parameters: [
			{name: "clientId", description: "The client Id", required:true, dataType: "string", paramType: "path"},
			{name: "value", description: "The message data", required:true, dataType: "Value", paramType: "body"},
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});

	var files_doc = swagger.createResource("/docs/files",  {description: "Files distribution."});
	files_doc.models.Value = {
	};
	files_doc.get("/files", "Receive a list of files.", {
	    nickname: "getFiles",
		responseClass: "List[string]",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});

	var file_doc = swagger.createResource("/docs/file",  {description: "File distribution."});
	file_doc.models.Value = {
	};
	file_doc.post("/file/upload", "upload a file", {
	    nickname: "uploadFile",
		responseClass: "",
		parameters: [],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	file_doc.post("/file/upload/{name}", "upload a file", {
	    nickname: "uploadFile",
		responseClass: "",
		supportedContentTypes: ["application/octed-stream"],
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"},
			{name: "data", description: "data", required:true, dataType: "string", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	file_doc.put("/file/upload/{name}", "upload a file", {
	    nickname: "uploadFile",
		responseClass: "",
		supportedContentTypes: ["application/octed-stream"],
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"},
			{name: "data", description: "data", required:true, dataType: "string", paramType: "body"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	file_doc.get("/file/download/{name}", "download a file", {
	    nickname: "downloadFile",
		responseClass: "",
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
	file_doc.delete("/file/{name}", "delete a file", {
	    nickname: "deleteFile",
		responseClass: "",
		parameters: [
			{name: "name", description: "file name", required:true, dataType: "string", paramType: "path"}
		],
		"errorResponses":[
			{
				"code": 500,
				"reason": "Script error."
			}
		]
	});
}