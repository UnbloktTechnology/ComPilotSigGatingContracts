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
	@$(call compile,sigVerifiers/TxAuthDataVerifier.mligo,TxAuthDataVerifier.tz, -m Verifier)
	@$(call compile,sigVerifiers/TxAuthDataVerifier.mligo,TxAuthDataVerifier.json, -m Verifier --michelson-format json)
#	@$(call compile,signerManager/NexeraIDSignerManager.mligo,NexeraIDSignerManager.tz, -m C)

test: ## run tests (SUITE=asset_approve make test)
ifndef SUITE
	@$(call test,TxAuthDataVerifier.test.mligo)
#	@$(call test,NexeraIDSignerManager.test.mligo)
else
	@$(call test,$(SUITE).test.mligo)
endif

sign:
	@echo "Running deploy script\n"
	@cd scripts && npm run signdata

signauthdata:
	@echo "Running deploy script\n"
	@cd scripts && npm run signauthdata

scripts_install:
	@echo "Installing deploy script dependencies"
	@cd scripts && npm install
	@echo ""