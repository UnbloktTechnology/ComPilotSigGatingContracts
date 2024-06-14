SHELL := /bin/bash

PROJECT=$(notdir $(CURDIR))

help:
	@grep -E '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

ifndef LIGO
LIGO=docker run --platform linux/amd64 -u $(id -u):$(id -g) --rm -v "$(PWD)":"$(PWD)" -w "$(PWD)" ligolang/ligo:1.6.0
endif
# ^ use LIGO en var bin if configured, otherwise use docker

compile = $(LIGO) compile contract --library . --project-root ./contracts ./contracts/$(1) -o ./compiled/$(2) $(3) 
# ^ Compile contracts to Michelson or Micheline

test = @$(LIGO) run test $(project_root) ./test/$(1) --no-warn
# ^ run given test file


install: ## install LIGO dependencies
	@$(LIGO) install


.PHONY: test compile
compile: ## compile contracts to Michelson
	@mkdir -p compiled
	@$(call compile,signerManager/NexeraIDSignerManager.mligo,NexeraIDSignerManager.tz, -m SignerManager)
	@$(call compile,signerManager/NexeraIDSignerManager.mligo,NexeraIDSignerManager.json, -m SignerManager --michelson-format json)
	@$(call compile,examples/nftminter.mligo,nftminter.tz, -m NftMinter)
	@$(call compile,examples/nftminter.mligo,nftminter.json, -m NftMinter --michelson-format json)
	@$(call compile,examples/proxy.mligo,proxy.tz, -m ProxyVerifier)
	@$(call compile,examples/fa2_for_proxy.mligo,fa2_for_proxy.tz, -m NftMinterForProxy)
	@$(call compile,examples/extended_gated_nftminter.mligo,extended_gated_nftminter.tz, -m NftMinterExt)
	@$(call compile,examples/extended_gated_nftminter.mligo,extended_gated_nftminter.json, -m NftMinterExt --michelson-format json)



test: ## run tests (SUITE=extended_gated_nftminter make test)
ifndef SUITE
	@$(call test,NexeraIDSignerManager.test.mligo)
	@$(call test,nftminter.test.mligo)
	@$(call test,proxy.test.mligo)
	@$(call test,extended_gated_nftminter.test.mligo)

else
	@$(call test,$(SUITE).test.mligo)
endif

#######################################
#            for TESTNET              #
#######################################

sign: 
	@echo "Running sign script\n"
	@npm run sign

scripts_install:  ## Install typescripts dependencies (including Taquto)
	@echo "Installing deploy script dependencies"
	@npm install
	@echo ""

deploy:  ## Deploy the extended_gated_nftminter contract on Ghostnet
	@echo "Running deploy script\n"
	@npm run deploy

mint:  ## Trigger the exec_gated_offchain entrypoint of the extended_gated_nftminter contract on Ghostnet (scripts/manual/mint_offchain.ts)
	@echo "Running mint script\n"
	@npm run mint

#######################################
#            SANDBOX                  #
#######################################
sandbox-start: ## Sandbox - Start Flextesa sandbox
	@./scripts/run-sandbox $(PROJECT)

sandbox-stop: ## Sandbox - Stop Flextesa sandbox
	@docker stop $(PROJECT)-sandbox

integration-test: ## Launch tests on a the sandbox (local network)  
	@echo "Running integration test script\n"
	@npm run test

localsign:  ##@Sandbox - User Bob signs data
	@echo "Running sign script (local)\n"
	@npm run localsign

localdeploy:   ##@Sandbox - Alice deploys a NftMinter
	@echo "Running deploy script (local)\n"
	@npm run localdeploy

localmint:   ##@Sandbox - Alice sends a message (signed offchain by bob) to the  NftMinter contract.
	@echo "Running mint script (local)\n"
	@npm run localmint

localdisplay:   ##@Sandbox - Alice storage of the  NftMinter contract.
	@echo "Running display script (local)\n"
	@npm run localdisplay