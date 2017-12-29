#!/usr/bin/env bash

main() {

	local source_dir="$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )"
	local root_dir="$source_dir"'/..'
	local pack_source_dir="$root_dir"'/app'
	local pack_target_dir="$root_dir"'/export'

	echo "packing [$pack_source_dir => $pack_target_dir]"

	pushd "$pack_source_dir" \
	    && zip -v "$pack_target_dir"'/wokitoki.zip' -r * \
	    && popd
}

main
