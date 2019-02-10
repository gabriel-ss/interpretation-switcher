#include "Eigen/Dense"
#include <cmath>

/**
 * Compute the chroma features of a signal from its Short Time Fourier Transform
 *
 * The transform must be provided as a matrix in which each column represents a
 * frame and with time evolving along the second dimension. The return will be a
 * matrix of size 12xN where N is the number of frames of the STFT and each
 * column is a vector of normalized chroma features.
 *
 *
 * @param stft The Short Time Fourier Transform of the signal from which
 * the features must be computed.
 * @param fs          The sampling rate of the signal.
 * @param wsize       The number of samples of the window used in the STFT.
 * @param gamma       The compression factor to be used in the chroma features
 * extraction.
 * @param epsilon     The smallest norm that a chroma vector needs to have to
 * not be replaced by a stub one.
 */
Eigen::Matrix<double, 12, Eigen::Dynamic> chroma(
	const Eigen::MatrixXcd& stft,
	double fs,
	unsigned wsize,
	double gamma,
	double epsilon
) {

	// The number of chroma vectors is defined by the frames in the STFT
	unsigned nOfFrames = stft.cols();

	Eigen::Matrix<double, 128, Eigen::Dynamic> pitchSpectrum(128, nOfFrames);


	Eigen::Matrix<Eigen::Index, 129, 1> pitchStarts;
	Eigen::Matrix<Eigen::Index, 128, 1> pitchLengths;


	// The bound frequencies of each one of the pitch classes
	for (Eigen::Index i = 0; i < 129; i++) pitchStarts(i) =
		(Eigen::Index)std::round((wsize/fs)*440*std::pow(2, (((i - 0.5) - 69)/12)));

	for (Eigen::Index i = 0; i < 128; i++) pitchLengths(i) =
		1 + pitchStarts(i + 1) - pitchStarts(i);


	for (Eigen::Index n = 0; n < nOfFrames; n++) {
		for (Eigen::Index p = 0; p < 128; p++) {

			// The pitch spectrum is a log spaced spectrum where a component is
			// proportional to the sum of the power of all stft components inside
			// the bounds of a pitch class
			pitchSpectrum(p, n) =
				stft.block(pitchStarts(p), n, pitchLengths(p), 1)
				.cwiseAbs2()
				.sum();

		}
	}


	Eigen::Matrix<double, 12, Eigen::Dynamic> chroma =
		Eigen::MatrixXd::Zero(12, nOfFrames);


	for (Eigen::Index n = 0; n < nOfFrames; n++) {
		for (Eigen::Index p = 0; p < 128; p++) {

			// A chroma vector is given by the sum of the pitch classes of the same
			// note in all octaves
			chroma(p % 12, n) += pitchSpectrum(p, n);

		}
	}


	// Compresses the chroma vectors
	chroma = (1 + gamma * chroma.array()).log10();
	Eigen::Matrix<double, 12, 1> stubFeature =
		Eigen::Matrix<double, 12, 1>::Ones() / sqrt(12);

	// Evaluates the norm of each chroma vector...
	for (Eigen::Index i = 0; i < chroma.cols(); i++) {

		double norm;
		// ...and if it's smaller than the epsilon parameter normalizes the vector
		if ((norm = chroma.col(i).norm()) > epsilon)
			chroma.col(i) /= norm;
		// Otherwise replaces the vector with a stub one
		else
			chroma.col(i) = stubFeature;

	}


	return chroma;

}
