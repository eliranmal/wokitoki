#!/usr/bin/env bash

main() {

	local source_dir="$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )"
	local root_dir="$source_dir"'/..'
	local pack_source="$root_dir"'/dist'
	local pack_target="$root_dir"'/export/wokitoki.zip'

	echo
	echo "packing [$pack_source => $pack_target]"

	pushd "$pack_source" \
	    && zip -v "$pack_target" -r * \
	    && popd
}

main
