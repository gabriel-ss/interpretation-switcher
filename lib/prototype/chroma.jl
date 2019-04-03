"""
function chroma(stft::Matrix{Complex{Cdouble}},
	fs::Cdouble, wsize::Cuint, γ::Cdouble, ϵ::Cdouble
)::Matrix{Cdouble}

Compute the chroma features of a signal from its Short Time Fourier Transform.

The transform must be provided as a matrix in which each column represents a
frame and with time evolving along the second dimension. The return will be a
matrix of size 12xN where N is the number of frames of the STFT and each column
is a vector of normalized chroma features.


**Parameters:**

`stft`: The Short Time Fourier Transform of the signal from which the features
must be computed.

`fs`: The sampling rate of the signal.

`wsize`: The number of samples of the window used in the STFT.

`γ`: The compression factor to be used in the chroma features extraction.

`ϵ`: The smallest norm that a chroma vector needs to have to not be replaced by
a stub one.
"""
function chroma(
	stft::Matrix{Complex{Cdouble}},
	fs::Cdouble,
	wsize::Cuint,
	γ::Cdouble,
	ϵ::Cdouble
)::Matrix{Cdouble}


	# The number of chroma vectors is defined by the frames in the STFT
	nofframes = size(stft)[2]
	pitchspectrum = Matrix{Cdouble}(undef, 128, nofframes)

	# Relation of a pitch with a frequency defined by the MIDI standard
	pitch2freq(p) = round(Cint, (wsize/fs)*2^((p - 69)/12)*440)

	# The bound frequencies of each one of the pitch classes
	bounds = [1 + pitch2freq(p - 0.5) for p in 0:128]


	for n in 1:nofframes

		# The pitch spectrum is a log spaced spectrum where a component is
		# proportional to the sum of the power of all stft components inside the
		# bounds of a pitch class
		pitchspectrum[:, n] =
			[sum(abs2.(stft[bounds[i]:bounds[i + 1],n])) for i in 1:128]

	end


	chroma = Matrix{Cdouble}(undef, 12, nofframes)


	for n in 1:nofframes

		# A chroma vector is given by the sum of the pitch classes of the same
		# note in all octaves
		chroma[:, n] =
			[sum(pitchspectrum[(class % 12 + 1):12:end, n]) for class in 0:11]

	end


	# Compresses the chroma vectors
	chroma = log10.(1 .+ γ .* chroma)

	stubFeature = ones(12)./√12

	# Evaluates the norm of each chroma vector...
	for i in 1:nofframes

		# ...and if it's smaller than the ϵ parameter normalizes the vector
		if ((norm = √(sum(chroma[:, i].^2))) > ϵ)
			chroma[:, i] ./= norm
		# Otherwise replaces the vector with a stub one
		else
			chroma[:, i] = stubFeature
		end

	end


	return chroma

end
