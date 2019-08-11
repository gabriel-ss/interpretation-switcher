#include "libsndalign.h"
#include <complex>
#include "Eigen/Dense"


Eigen::Matrix<std::complex<pcm_t>, Eigen::Dynamic, Eigen::Dynamic> stft(
	const Eigen::Matrix<pcm_t, Eigen::Dynamic, 1>& input,
	index_t wsize,
	index_t overlap
);


Eigen::Matrix<pcm_t, 12, Eigen::Dynamic> chroma(
	const Eigen::Matrix<std::complex<pcm_t>, Eigen::Dynamic, Eigen::Dynamic>& stft,
	pcm_t fs,
	index_t wsize,
	pcm_t gamma,
	pcm_t epsilon
);


index_t* dtw(
	const Eigen::Matrix<pcm_t, Eigen::Dynamic, Eigen::Dynamic>& sequence1,
	const Eigen::Matrix<pcm_t, Eigen::Dynamic, Eigen::Dynamic>& sequence2,
	index_t* alignmentLength
);


index_t* soundAlign(
	pcm_t* signal1,
	index_t length1,
	pcm_t* signal2,
	index_t length2,
	pcm_t fs,
	index_t wsize,
	index_t overlap,
	pcm_t gamma,
	pcm_t epsilon,
	index_t* const alignmentLength
) {

	Eigen::Matrix<pcm_t, 12, Eigen::Dynamic> chromaFeatures1, chromaFeatures2;

	{

		Eigen::Matrix<std::complex<pcm_t>, Eigen::Dynamic, Eigen::Dynamic> stft1 =
			stft(Eigen::Map<Eigen::Matrix<pcm_t, Eigen::Dynamic, 1>> (signal1, length1), wsize, overlap);
		chromaFeatures1 =	chroma(stft1, fs, wsize, gamma, epsilon);

	}

	{

		Eigen::Matrix<std::complex<pcm_t>, Eigen::Dynamic, Eigen::Dynamic> stft2 =
			stft(Eigen::Map<Eigen::Matrix<pcm_t, Eigen::Dynamic, 1>> (signal2, length2), wsize, overlap);
		chromaFeatures2 =	chroma(stft2, fs, wsize, gamma, epsilon);

	}


	return dtw(chromaFeatures1, chromaFeatures2, alignmentLength);

}


void freeSndAligment(void* ptr) {
	free(ptr);
}
