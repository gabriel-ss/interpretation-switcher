using Test
include("../chroma.jl")
include("../dtw.jl")


stransf = Matrix{Complex{Cdouble}}(undef, 2049, 1)
stransf[:,1] = zeros(2049)
stransf[42] = 1000
# stranf represents a 440Hz frequency stft frame
@test chroma(stransf, 44100., Cuint(4096), 1., 1.) ==
	[0. 0. 0. 0. 0. 0. 0. 0. 0. 1. 0. 0.]'


feat = Cdouble.([1 1 1; 2 2 2; 3 3 3; 4 4 4])
feat ./= sqrt.([1 2 3 4]*[1 2 3 4]')
# dtw implementation expects normalized inputs
@test dtw(feat, feat) == ([1, 2, 3], [1, 2, 3])
