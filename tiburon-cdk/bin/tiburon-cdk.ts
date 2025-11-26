#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

// Tags globales para todo el proyecto
const projectTags = {
  'Project': 'Tiburon-AWS-UserGroup',
  'Environment': 'Development',
  'Owner': 'Siegfried-FS',
  'Purpose': 'Community-Platform',
  'Repository': 'github.com/Siegfried-FS/Tiburon',
  'CostCenter': 'AWS-UserGroup-PlayaVicente'
};

// Stack de base de datos
const databaseStack = new DatabaseStack(app, 'TiburonDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Stack de API (depende de la base de datos)
const apiStack = new ApiStack(app, 'TiburonApiStack', {
  contentTable: databaseStack.contentTable,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// Aplicar tags a todos los recursos
Object.entries(projectTags).forEach(([key, value]) => {
  cdk.Tags.of(databaseStack).add(key, value);
  cdk.Tags.of(apiStack).add(key, value);
});

// Dependencia explícita
apiStack.addDependency(databaseStack);
