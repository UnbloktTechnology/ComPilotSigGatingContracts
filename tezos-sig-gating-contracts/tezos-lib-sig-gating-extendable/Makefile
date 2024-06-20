SHELL := /bin/bash

PROJECT=$(notdir $(CURDIR))

help:
	@grep -E '^[ a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

ifndef LIGO
LIGO=docker run --platform linux/amd64 -u $(id -u):$(id -g) --rm -v "$(PWD)":"$(PWD)" -w "$(PWD)" ligolang/ligo:1.6.0
endif
# ^ use LIGO en var bin if configured, otherwise use docker

compile = $(LIGO) compile contract --library . --project-root . ./$(1) -o ./compiled/$(2) $(3) 
# ^ Compile contracts to Michelson or Micheline

test = @$(LIGO) run test $(project_root) ./test/$(1) --no-warn
# ^ run given test file

install: ## install dependencies
	@$(LIGO) install


.PHONY: test compile
compile: ## compile contracts to Michelson
	@mkdir -p compiled
	@$(call compile,examples/extended_gated_nftminter.mligo,extended_gated_nftminter.tz, -m NftMinterExt)
	@$(call compile,examples/extended_gated_nftminter.mligo,extended_gated_nftminter.json, -m NftMinterExt --michelson-format json)
	@$(call compile,examples/gatednftminter_nodispatch.mligo,gatednftminter_nodispatch.tz, -m NftMinterExtNoDispatch)
	@$(call compile,examples/gatednftminter_nodispatch.mligo,gatednftminter_nodispatch.json, -m NftMinterExtNoDispatch --michelson-format json)
	@$(call compile,examples/gatednftminter_simple.mligo,gatednftminter_simple.tz, -m NftMinterSimple)
	@$(call compile,examples/gatednftminter_simple.mligo,gatednftminter_simple.json, -m NftMinterSimple --michelson-format json)


test: ## run tests (SUITE=asset_approve make test)
ifndef SUITE
	@$(call test,extended_gated_nftminter.test.mligo)
	@$(call test,gatednftminter_nodispatch.test.mligo)
	@$(call test,gatednftminter_simple.test.mligo)

else
	@$(call test,$(SUITE).test.mligo)
endif
