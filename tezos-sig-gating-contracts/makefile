SHELL := /bin/bash

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


install: ## install dependencies
	@$(LIGO) install


.PHONY: test compile
compile: ## compile contracts to Michelson
	@mkdir -p compiled
	@$(call compile,signerManager/NexeraIDSignerManager.mligo,NexeraIDSignerManager.tz, -m SignerManager)
	@$(call compile,signerManager/NexeraIDSignerManager.mligo,NexeraIDSignerManager.json, -m SignerManager --michelson-format json)
	@$(call compile,examples/nftminter.mligo,nftminter.tz, -m NftMinter)
	@$(call compile,examples/nftminter.mligo,nftminter.json, -m NftMinter --michelson-format json)

test: ## run tests (SUITE=asset_approve make test)
ifndef SUITE
	@$(call test,NexeraIDSignerManager.test.mligo)
	@$(call test,nftminter.test.mligo)

else
	@$(call test,$(SUITE).test.mligo)
endif

signdata:
	@echo "Running sign script\n"
	@cd scripts && npm run signdata

sign:
	@echo "Running sign script\n"
	@cd scripts && npm run sign

repro:
	@echo "Running sign script\n"
	@cd scripts && npm run repro

scripts_install:
	@echo "Installing deploy script dependencies"
	@cd scripts && npm install
	@echo ""

deploy:
	@echo "Running deploy script\n"
	@cd scripts && npm run deploy

mint:
	@echo "Running mint script\n"
	@cd scripts && npm run mint