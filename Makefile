.PHONY: validate smoke package-build package-install-smoke ctx-aide-doctor ctx-aide-lint ctx-aide-test ctx-aide-loc-check ctx-aide-scan ctx-aide-query-smoke future-check skill-validate install-skill

CODEX_SKILLS_DIR ?= $(HOME)/.codex/skills

validate: ctx-aide-lint ctx-aide-test ctx-aide-loc-check future-check skill-validate

smoke: validate ctx-aide-scan ctx-aide-query-smoke ctx-aide-doctor

package-build:
	npm run --silent build -- --json

package-install-smoke:
	npm run --silent install:local -- --json

ctx-aide-doctor:
	node tools/ctx-aide/ctx-aide.mjs doctor --json

ctx-aide-lint:
	node tools/ctx-aide/ctx-aide.mjs lint --json

ctx-aide-test:
	node tools/ctx-aide/ctx-aide.test.mjs

ctx-aide-loc-check:
	node tools/ctx-aide/ctx-aide.mjs loc check --json

ctx-aide-scan:
	node tools/ctx-aide/ctx-aide.mjs scan --json

ctx-aide-query-smoke:
	node tools/ctx-aide/ctx-aide.mjs query --path tools/ctx-aide/ctx-aide.mjs --task "ctx-aide dogfood rule polarity" --agent codex --budget 1200 --json

future-check:
	node tools/ctx-aide/ctx-aide.mjs future check --json

skill-validate:
	python3 /Users/jove/code/codex-skills/skills/.system/skill-creator/scripts/quick_validate.py skills/ctx-aide

install-skill: skill-validate
	mkdir -p "$(CODEX_SKILLS_DIR)"
	rm -rf "$(CODEX_SKILLS_DIR)/ctx-aide"
	cp -R skills/ctx-aide "$(CODEX_SKILLS_DIR)/ctx-aide"
	python3 /Users/jove/code/codex-skills/skills/.system/skill-creator/scripts/quick_validate.py "$(CODEX_SKILLS_DIR)/ctx-aide"
