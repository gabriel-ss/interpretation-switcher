{
	"targets": [
		{
			"target_name": "soundAlign",
			'include_dirs': ['/usr/include/eigen3'],
			"sources": ["lib/stft.cpp", "lib/chroma.cpp", "lib/dtw.cpp", "lib/libsndalign.cpp", "src/track-aligner/soundAlign.c"],
			'defines': ["pcm_t=float", "index_t=unsigned", "FORTIFY_SOURCE=2", "EIGEN_MPL2_ONLY", "NDEBUG"],
			'cflags': ["-Wall", "-std=c++11", "-pedantic", "-O2", "-ffast-math", "-fPIC", "-I/usr/include/eigen3/"],
			'linkflags': ["-Wall", "-std=c++11", "-O2"]
		}
	]

}
