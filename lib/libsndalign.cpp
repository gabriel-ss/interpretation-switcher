#include "libsndalign.h"
#include "Eigen/Dense"


Eigen::MatrixXcd stft(
	const Eigen::VectorXd& input,
	size_t wsize,
	size_t overlap
);


Eigen::Matrix<double, 12, Eigen::Dynamic> chroma(
	const Eigen::MatrixXcd& stft,
	double fs,
	unsigned wsize,
	double gamma,
	double epsilon
);


size_t* dtw(
	const Eigen::MatrixXd& sequence1,
	const Eigen::MatrixXd& sequence2,
	size_t* alignmentLength
);


size_t* soundAlign(
	double* signal1,
	size_t length1,
	double* signal2,
	size_t length2,
	double fs,
	size_t wsize,
	size_t overlap,
	double gamma,
	double epsilon,
	size_t* const alignmentLength
) {

	Eigen::Matrix<double, 12, Eigen::Dynamic> chromaFeatures1, chromaFeatures2;

	{

		Eigen::MatrixXcd stft1 =
			stft(Eigen::Map<Eigen::VectorXd> (signal1, length1), wsize, overlap);
		chromaFeatures1 =	chroma(stft1, fs, wsize, gamma, epsilon);

	}

	{

		Eigen::MatrixXcd stft2 =
			stft(Eigen::Map<Eigen::VectorXd> (signal2, length2), wsize, overlap);
		chromaFeatures2 =	chroma(stft2, fs, wsize, gamma, epsilon);

	}


	return dtw(chromaFeatures1, chromaFeatures2, alignmentLength);

}


void freeSndAligment(void* ptr) {
	free(ptr);
}
