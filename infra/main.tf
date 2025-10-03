locals {
  service_name = var.app_runner_service_name
  common_tags = {
    Service = local.service_name
  }
}

module "ecr" {
  source = "./modules/ecr"
  
  repository_name = var.ecr_repo_name
  tags            = local.common_tags
}

module "network" {
  source = "./modules/network"
  
  vpc_id                = var.vpc_id
  rds_security_group_id = var.rds_security_group_id
  rds_port              = var.rds_port
  enable_legacy_cidrs   = var.enable_legacy_cidrs
  legacy_cidrs          = var.legacy_cidrs
  service_name          = local.service_name
  tags                  = local.common_tags
}

module "secrets" {
  source = "./modules/secrets"
  
  database_url = "postgresql+psycopg2://${var.db_app_user}:${var.db_app_password}@${var.rds_endpoint}:${var.rds_port}/${var.database_name}?sslmode=require"
  service_name = local.service_name
  tags         = local.common_tags
}

module "apprunner" {
  source = "./modules/apprunner"
  
  service_name           = local.service_name
  ecr_repository_url     = module.ecr.repository_url
  vpc_id                 = var.vpc_id
  private_subnet_ids     = var.private_subnet_ids
  security_group_id      = module.network.app_runner_security_group_id
  database_url_secret_arn = module.secrets.database_url_secret_arn
  container_port         = var.container_port
  health_check_path      = var.health_check_path
  cpu                    = var.cpu
  memory                 = var.memory
  service_env            = var.service_env
  tags                   = local.common_tags
  
  depends_on = [
    module.network,
    module.secrets
  ]
}

module "monitoring" {
  source = "./modules/monitoring"
  
  rds_instance_identifier = split(".", var.rds_endpoint)[0]
  app_runner_service_name = local.service_name
  alarm_email             = var.alarm_email
  tags                    = local.common_tags
  
  depends_on = [
    module.apprunner
  ]
}
