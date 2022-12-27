import { Stack } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { join } from "path";
import { Code, Function as LambdaFunction,  Runtime, } from "aws-cdk-lib/aws-lambda";
export interface TableProps {
  tableName: string;
  primaryKey: string;
  createLambdaPath?: string;
  readLambdaPath?: string;
  updateLambdaPath?: string;
  deleteLambdaPath?: string;
}

export class GenericTable {
  private name: string;
  private primaryKey: string;
  private stack: Stack;
  private table: Table;

  private createLambda: LambdaFunction | undefined;
  private readLambda: LambdaFunction | undefined;
  private updateLambda: LambdaFunction | undefined;
  private deleteLambda: LambdaFunction | undefined;
  private props: TableProps;

  public constructor(stack: Stack, props: TableProps) {
    this.stack = stack;
    this.props = props;
    this.initialize();
  }

  public createLambdaIntegration: LambdaIntegration;
  public readLambdaIntegration: LambdaIntegration;
  public updateLambdaIntegration: LambdaIntegration;
  public deleteLambdaIntegration: LambdaIntegration;

  private initialize() {
    this.createTable();
    this.createLambdas();
    this.grandTableRights();
  }

  private createTable() {
    this.table = new Table(this.stack, this.props.tableName, {
      partitionKey: {
        name: this.props.primaryKey,
        type: AttributeType.STRING,
      },
      tableName: this.props.tableName,
    });
  }

private createLambdas(){
  if(this.props.createLambdaPath) {
    this.createLambda = this.createSingleLambda(this.props.createLambdaPath)
    this.createLambdaIntegration = new LambdaIntegration(this.createLambda);
  } 

  if (this.props.readLambdaPath) {
    this.readLambda = this.createSingleLambda(this.props.readLambdaPath);
    this.readLambdaIntegration = new LambdaIntegration(this.readLambda);

  }

  if (this.props.updateLambdaPath) {
    this.updateLambda = this.createSingleLambda(this.props.updateLambdaPath);
    this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda);

  }

  if (this.props.deleteLambdaPath) {
    this.deleteLambda = this.createSingleLambda(this.props.deleteLambdaPath);
    this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda);

  }
}

  private grandTableRights() {
    if(this.createLambda) {
      this.table.grantWriteData(this.createLambda)
    } 

    if(this.readLambda) {
      this.table.grantReadData(this.readLambda)
    } 

    if(this.updateLambda) {
      this.table.grantWriteData(this.updateLambda)
    } 

    if(this.deleteLambda) {
      this.table.grantWriteData(this.deleteLambda)
    }
  }
  private createSingleLambda(lambdaName: string): LambdaFunction {
    const lambdaId = `${this.props.tableName}-${lambdaName}`
    return new LambdaFunction(this.stack, lambdaId, {
      runtime: Runtime.NODEJS_16_X,
      code: Code.fromAsset(join(__dirname, '..','services',this.props.tableName)),
      handler: `${lambdaName}.handler`,
      functionName: lambdaId,
      environment: {
        TABLE_NAME: this.props.tableName,
        PRIMARY_KEY: this.props.primaryKey
      }
    });
  }
}