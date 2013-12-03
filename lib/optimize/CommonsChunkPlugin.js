/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
function CommonsChunkPlugin(filenameTemplate, entryPoints, minCount) {
	if(typeof entryPoints === "number") {
		minCount = entryPoints;
		entryPoints = undefined;
	}
	this.filenameTemplate = filenameTemplate;
	this.minCount = minCount || (entryPoints ? entryPoints.length : 2);
	this.entryPoints = entryPoints;
}
module.exports = CommonsChunkPlugin;
CommonsChunkPlugin.prototype.apply = function(compiler) {
	var filenameTemplate = this.filenameTemplate;
	var minCount = this.minCount;
	var entryPoints = this.entryPoints;
	compiler.plugin("compilation", function(compilation) {
		compilation.plugin("optimize-chunks", function(chunks) {
			var commonModulesCount = [];
			var commonModules = [];
			var usedChunks = chunks.filter(function(chunk) {
				if(!chunk.entry) return false;
				if(!entryPoints) return true;
				return entryPoints.indexOf(chunk.name) >= 0;
			});
			usedChunks.forEach(function(chunk) {
				chunk.modules.forEach(function(module) {
					var idx = commonModules.indexOf(module);
					if(idx < 0) {
						commonModules.push(module);
						commonModulesCount.push(1);
					} else {
						commonModulesCount[idx]++;
					}
				});
			});
			var commonChunk = this.addChunk();
			commonModulesCount.forEach(function(count, idx) {
				if(count >= minCount) {
					var module = commonModules[idx];
					module.chunks.slice().forEach(function(chunk) {
						module.removeChunk(chunk);
					});
					commonChunk.addModule(module);
					module.addChunk(commonChunk);
				}
			});
			usedChunks.forEach(function(chunk) {
				chunk.parents = [commonChunk];
				commonChunk.chunks.push(chunk);
				chunk.entry = false;
			});
			commonChunk.entry = true;
			commonChunk.id = 0;
			commonChunk.filenameTemplate = filenameTemplate;
		});
	});
};