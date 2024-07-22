SHELL := /bin/bash

PROJECT=$(notdir $(CURDIR))

help:
	@grep -E '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

ifndef LIGO
LIGO=docker run --platform linux/amd64 -u $(id -u):$(id -g) --rm -v "$(PWD)":"$(PWD)" -w "$(PWD)" ligolang/ligo:1.6.0
endif
# ^ use LIGO en var bin if configured, otherwise use docker

compile = $(LIGO) compile contract --library . --project-root . ./contracts/$(1) -o ./compiled/$(2) $(3) 
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
	@$(call compile,signerManager/NexeraIDSignerManagerMultisig.mligo,NexeraIDSignerManagerMultisig.tz, -m SignerManagerMultisig)
	@$(call compile,signerManager/NexeraIDSignerManagerMultisig.mligo,NexeraIDSignerManagerMultisig.json, -m SignerManagerMultisig --michelson-format json)
	@$(call compile,examples/nftminter.mligo,nftminter.tz, -m NftMinter)
	@$(call compile,examples/nftminter.mligo,nftminter.json, -m NftMinter --michelson-format json)
	@$(call compile,examples/proxy.mligo,proxy.tz, -m ProxyVerifier)
	@$(call compile,examples/fa2Proxy.mligo,fa2Proxy.tz, -m NftMinterForProxy)
	@$(call compile,examples/gatedNftMinterDispatch.mligo,gatedNftMinterDispatch.tz, -m NftMinterDispatch)
	@$(call compile,examples/gatedNftMinterDispatch.mligo,gatedNftMinterDispatch.json, -m NftMinterDispatch --michelson-format json)
	@$(call compile,examples/gatedNftMinterSimpleWithContractAddress.mligo,gatedNftMinterSimpleWithContractAddress.tz, -m NftMinterExtNoDispatch)
	@$(call compile,examples/gatedNftMinterSimpleWithContractAddress.mligo,gatedNftMinterSimpleWithContractAddress.json, -m NftMinterExtNoDispatch --michelson-format json)
	@$(call compile,examples/gatedNftClaimer.mligo,gatedNftClaimer.tz, -m NftClaimer)
	@$(call compile,examples/gatedNftClaimer.mligo,gatedNftClaimer.json, -m NftClaimer --michelson-format json)
	@$(call compile,examples/gatedNftMinterMulti.mligo,gatedNftMinterMulti.tz, -m NftMinterInternalDispatch)
	@$(call compile,examples/gatedNftMinterMulti.mligo,gatedNftMinterMulti.json, -m NftMinterInternalDispatch --michelson-format json)
	@$(call compile,examples/gatedNftMinterSimpleUnlimited.mligo,gatedNftMinterSimpleUnlimited.tz, -m NftMinterUnlimited)
	@$(call compile,examples/gatedNftMinterSimpleUnlimited.mligo,gatedNftMinterSimpleUnlimited.json, -m NftMinterUnlimited --michelson-format json)


test: ## run tests (SUITE=gatedNftMinterSimple make test)
ifndef SUITE
	@$(call test,gatedNftClaimer.test.mligo)
	@$(call test,gatedNftMinterSimpleUnlimited.test.mligo)
	@$(call test,NexeraIDSignerManager.test.mligo)
	@$(call test,NexeraIDSignerManagerMultisig.test.mligo)
	@$(call test,nftminter.test.mligo)
	@$(call test,proxy.test.mligo)
	@$(call test,gatedNftMinterDispatch.test.mligo)
	@$(call test,gatedNftMinterSimpleWithContractAddress.test.mligo)
	@$(call test,gatedNftMinterMulti.test.mligo)

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
	@cd scripts && ./run-sandbox-tezbox $(PROJECT)

sandbox-stop: ## Sandbox - Stop Flextesa sandbox
	@docker stop $(PROJECT)-sandbox

sandbox-tezbox-start: ## Sandbox - Start Flextesa sandbox
	@cd scripts && ./run-sandbox-tezbox $(PROJECT)
# @./scripts/run-sandbox-tezbox $(PROJECT)

sandbox-flextesa-start: ## Sandbox - Start Flextesa sandbox
	@./scripts/run-sandbox $(PROJECT)

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

localdisplay:   ## Display storage of contract (deployment/nftminter.ts) on @Sandbox.
	@echo "Running display script (local)\n"
	@npm run localdisplay

locallisten:	## Run Event listener on @Sandbox.
	@echo "Running Event listener (local)\n"
	@npm run locallisten