const AWS = require("aws-sdk");
const DDb = require("aws-sdk/clients/dynamodb");

const Region = "ap-southeast-2";
const Name = "10810251_Data";

const DB_Client = new DDb({
    region: Region
});

async function CrudeExists() {
    var res = false;
    //await DB_Client.listTables({}, (err, data) => {
    //    if (err) {
    //        console.log(err);
    //        return res;
    //    }
    //    debug = data;
    //    res = Name in data.TableNames;
    //});
    //console.log(debug);
    //return res;

    try {
        var ValidTables = await DB_Client.listTables({}).promise();
        res = ValidTables.TableNames.includes(Name);
    }
    catch (err) {
        //console.error(err);
    }
    return res;
}



exports.IsValidated = false;

exports.Validate = async function () {
    if (!await CrudeExists()) {
        //#region Ditched table create, namely because I never got to test it, and it was said we need to have made the infrastructure externally
        //table no exist
        //DB_Client.createTable({
        //    TableName: Name,
        //    KeySchema: [
        //        {
        //            'AttributeName': 'ID',
        //            'KeyType': 'HASH'
        //        }
        //    ],
        //    AttributeDefinitions: [
        //        {
        //            'AttributeName': 'ID',
        //            'AttributeType': 's'
        //        },
        //        {
        //            'AttributeName': 'Count',
        //            'AttributeType': 'N'
        //        }
        //    ],
        //});
        //#endregion
        throw new Error(`Failed to validate the existance of a table. Please verify the credentials and that a table with the name ${Name} is present`);
    }

    //check if the entry exists for viewcount
    console.log("DynamoDB table Validated");
    exports.IsValidated = true;
}




exports.getEntry = async function() {
    if (!exports.IsValidated)
        return null;

    var results = null;
    //#region old
    //DB_Client.getItem({
    //    TableName: Name,
    //    ExpressionAttributeNames: {
    //        "#PK": "qut-username",
    //    },
    //    ProjectionExpression: "#PK, viewcount",
    //    Key: {
    //        "qut-username": {
    //            "S": "n10810251@qut.edu.au"
    //        }
    //    }
    //}, (err, data) => {
    //    if (err) {
    //        throw err;
    //    }
    //    console.log(data);
    //    results = parseInt(data.Item["viewcount"].N);//this should be data = { Item: { viewcount: { N: *value* } } }
    //});
    //#endregion

    //swapped to try->catch to return outside more effectively
    try {
        var data = await DB_Client.getItem({
            TableName: Name,
            ExpressionAttributeNames: {
                "#PK": "qut-username",
            },
            ProjectionExpression: "#PK, viewcount",
            Key: {
                "qut-username": {
                    "S": "n10810251@qut.edu.au"
                }
            }
        }).promise();
        results = parseInt(data.Item["viewcount"].N);
    }
    catch (err) {
        //Adding this, since we validate the table exists prior to being able to run this code
        //and thus the error resulted should relate to if the entry exists or not
        results = 0;
        exports.setEntry(0);
    }
    return results;
}

exports.setEntry = async function (value) {
    if (!exports.IsValidated)
        return;

    if (isNaN(value))
        return;

    value = value.toString();

    DB_Client.updateItem({
        TableName: Name,
        ExpressionAttributeNames: {
            "#c": "viewcount"
        },
        ExpressionAttributeValues: {
            ":vc": {
                N: value
            }
        },
        Key: {
            'qut-username': {
                "S": 'n10810251@qut.edu.au'
            }
        },
        UpdateExpression: "SET #c = :vc"
    }, (err, data) => {
        if (err) {
            throw err;
        }
    });
    return;
}
