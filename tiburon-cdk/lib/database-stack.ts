import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly contentTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tabla principal para todo el contenido
    this.contentTable = new dynamodb.Table(this, 'TiburonContentTable', {
      tableName: 'tiburon-content',
      partitionKey: {
        name: 'content_type',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'item_id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Mejor para free tier
      removalPolicy: cdk.RemovalPolicy.RETAIN, // No borrar en destroy
      pointInTimeRecovery: true, // Backup automático
    });

    // GSI1: Para consultar por status y fecha
    this.contentTable.addGlobalSecondaryIndex({
      indexName: 'status-created_at-index',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'created_at',
        type: dynamodb.AttributeType.STRING
      }
    });

    // GSI2: Para consultar por autor
    this.contentTable.addGlobalSecondaryIndex({
      indexName: 'author-created_at-index',
      partitionKey: {
        name: 'author_name',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'created_at',
        type: dynamodb.AttributeType.STRING
      }
    });

    // Output para usar en otros stacks
    new cdk.CfnOutput(this, 'ContentTableName', {
      value: this.contentTable.tableName,
      exportName: 'TiburonContentTableName'
    });

    new cdk.CfnOutput(this, 'ContentTableArn', {
      value: this.contentTable.tableArn,
      exportName: 'TiburonContentTableArn'
    });
  }
}
