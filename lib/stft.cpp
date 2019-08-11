#include "libsndalign.h"
#include <complex>
#include "Eigen/Dense"
#include "unsupported/Eigen/FFT"


/**
 * Computes the Short Time Fourier Transform of a signal
 *
 * @param  input   The signal from which the transform must be computed.
 * @param  wsize   The number of samples of the window to be used in the STFT.
 * @param  overlap The number of samples shared by two windows in the STFT.
 *
 * @return         A matrix where each column is a frame of the STFT.
 */
Eigen::Matrix<std::complex<pcm_t>, Eigen::Dynamic, Eigen::Dynamic> stft(
	const Eigen::Matrix<pcm_t, Eigen::Dynamic, 1>& input,
	index_t wsize,
	index_t overlap
) {

	index_t nOfFrames = (input.size() - overlap) / (wsize - overlap);
	Eigen::FFT<pcm_t> fft;
	Eigen::Matrix<pcm_t, Eigen::Dynamic, 1> tmp(wsize);
	Eigen::Matrix<std::complex<pcm_t>, Eigen::Dynamic, Eigen::Dynamic> output(wsize, nOfFrames);


	for (index_t i = 0; i < nOfFrames; i++) {

		tmp = input.block(i * (wsize - overlap), 0, wsize, 1);
		output.col(i) = fft.fwd(tmp);

	}


	return output;

}
