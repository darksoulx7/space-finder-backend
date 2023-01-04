import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AuthorizationType, MethodOptions, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AuthorizerWrapper } from "./auth/AuthorizationWrapper";
import { GenericTable } from "./GenericTable";

export class SpaceStack extends Stack {
  private api = new RestApi(this, "SpaceApi");
  private authorizer: AuthorizerWrapper
  private spacesTable = new GenericTable(this, {
    tableName: "SpacesTable",
    primaryKey: "spaceId",
    createLambdaPath: "create",
    readLambdaPath: "read",
    secondaryIndexes: ['galaxyName'],
    updateLambdaPath: "update",
    deleteLambdaPath: "delete"
  });

  

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.authorizer = new AuthorizerWrapper(this,this.api)
    
      const optionWithAuthorizer: MethodOptions = {
        authorizationType: AuthorizationType.COGNITO,
        authorizer: {
          authorizerId: this.authorizer.authorizer.authorizerId
        }
      }

    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration,optionWithAuthorizer);
    spaceResource.addMethod("PUT", this.spacesTable.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.spacesTable.deleteLambdaIntegration);

  }
}


    // const dynamoPolicy = new PolicyStatement();
    // dynamoPolicy.addActions("dynamodb:*");
    // dynamoPolicy.addResources("*");

 // const putItemSpacesTable = new LambdaFunction(this, "putItemSpacesTable", {
    //   runtime: Runtime.NODEJS_16_X,
    //   code: Code.fromAsset(join(__dirname, "../services/SpacesTable")),
    //   handler: "create.handler",
    // });
    // putItemSpacesTable.addToRolePolicy(dynamoPolicy);

    // const putLambdaResource = this.createApi.root.addResource("create");
    // putLambdaResource.addMethod("PUT", putSpacesIntegration);
   // const helloLambda = new LambdaFunction(this, "helloLambda", {
    //   runtime: Runtime.NODEJS_16_X,
    //   code: Code.fromAsset(join(__dirname, "..", "services", "hello")),
    //   handler: "hello.main",
    // });
  // private api = new RestApi(this, "SpaceApi");

    // const helloLambdaIntegreation = new LambdaIntegration(helloLambda);
    // const helloLambdaResource = this.api.root.addResource("hello");
    // helloLambdaResource.addMethod("GET", helloLambdaIntegreation);


     // const putItemLambdaNodejs = new LambdaFunction(
    //   this,
    //   "putItemLambdaNodejs",
    //   {
    //     runtime: Runtime.NODEJS_16_X,
    //     code: Code.fromAsset(join(__dirname, "../services/SpaceTable")),
    //     handler: "create.handler",
    //   }
    // );

     //  const putAPiIntegration = new LambdaIntegration(putItemLambdaNodejs);
    //  const putLambdaResource = this.api2.root.addResource("create");
    //  putLambdaResource.addMethod("PUT", putAPiIntegration);
    // putItemLambdaNodejs.addToRolePolicy(dynamoPolicy);
