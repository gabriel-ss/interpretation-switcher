using DSP
include("chroma.jl")
include("dtw.jl")


"""
sndalign(
	signal1::Vector{Cdouble}, signal2::Vector{Cdouble},
	fs::Cdouble, wsize::Csize_t, overlap::Csize_t, γ::Cdouble, ϵ::Cdouble
)

Compute the set of indices `path1, path2` that align the two given signals.

The alignment is computed with the dtw algorithm over a set of chroma features
extracted from the signals' stft, therefore the returned vectors give the
alignment of the windows of the transform and not of the signals' samples
themselves.


**Parameters:**

`signal1`, `signal2`: The two signals to be aligned.

`fs`: The sampling rate of the signals.

`wsize`: The number of samples of the window to be used in the STFT.

`overlap`: The number of samples shared by two windows in the STFT.

`γ`: The compression factor to be used in the chroma features extraction.

`ϵ`: The smallest norm that a chroma vector needs to have to not be replaced by
a stub one.
"""
function sndalign(
	signal1::Vector{Cdouble},
	signal2::Vector{Cdouble},
	fs::Cdouble,
	wsize::Csize_t,
	overlap::Csize_t,
	γ::Cdouble,
	ϵ::Cdouble
)


   stft1 = stft(signal1, Int64(wsize), Int64(overlap);fs=fs,window=ones)
	chroma1 = chroma(stft1, fs, wsize, γ, ϵ)

	stft2 = stft(signal2, Int64(wsize), Int64(overlap);fs=fs,window=ones)
	chroma2 = chroma(stft2, fs, wsize, γ, ϵ)

	return dtw(chroma1, chroma2)

end

