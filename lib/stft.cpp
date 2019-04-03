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
Eigen::MatrixXcd stft(
	const Eigen::VectorXd& input,
	size_t wsize,
	size_t overlap
) {

	size_t nOfFrames = (input.size() - overlap) / (wsize - overlap);
	Eigen::FFT<double> fft;
	Eigen::VectorXd tmp(wsize);
	Eigen::MatrixXcd output(wsize, nOfFrames);


	for (size_t i = 0; i < nOfFrames; i++) {

		tmp = input.block(i * (wsize - overlap), 0, wsize, 1);
		output.col(i) = fft.fwd(tmp);

	}


	return output;

}
