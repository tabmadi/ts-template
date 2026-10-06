#!/usr/bin/env bash
set -euo pipefail

# Installing Moonrepo proto https://moonrepo.dev/proto
if ! command -v proto >/dev/null 2>&1; then
	bash -c "$(curl -fsSL https://moonrepo.dev/install/proto.sh)"
	# The installer only updates shell profiles, so make proto visible to the rest of this script
	export PATH="${PROTO_HOME:-$HOME/.proto}/shims:${PROTO_HOME:-$HOME/.proto}/bin:$PATH"
fi

# Installing all the other tools with the proto
proto use

# Installing Git hooks with Lefthook
lefthook install
