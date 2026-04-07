variable "resource_group_name" {
  type        = string
  description = "Name of the Azure Resource Group"

  validation {
    condition     = length(var.resource_group_name) >= 3
    error_message = "Resource group name must be at least 3 characters long."
  }
}

variable "location" {
  type        = string
  description = "Azure region where resources will be deployed"
  default     = "East US"
}

variable "cluster_name" {
  type        = string
  description = "Name of the AKS cluster"

  validation {
    condition     = length(var.cluster_name) >= 3
    error_message = "Cluster name must be at least 3 characters long."
  }
}

variable "kubernetes_version" {
  type        = string
  description = "Kubernetes version to deploy in AKS"

  validation {
    condition     = can(regex("^1\\.[0-9]+\\.[0-9]+$", var.kubernetes_version))
    error_message = "Kubernetes version must be in format like 1.27.3"
  }
}

variable "system_node_count" {
  type        = number
  description = "Number of nodes in the system node pool"
  default     = 2

  validation {
    condition     = var.system_node_count >= 1 && var.system_node_count <= 10
    error_message = "Node count must be between 1 and 10."
  }
}

variable "acr_name" {
  type        = string
  description = "Name of Azure Container Registry"

  validation {
    condition     = length(var.acr_name) >= 5
    error_message = "ACR name must be at least 5 characters long."
  }
}