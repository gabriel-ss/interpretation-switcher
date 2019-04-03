#include "Eigen/Dense"
#include <list>
#include <algorithm>


/**
 * Compute the set of indices `path1, path2` that give the alignment of two
 * sequences over their last dimension by dynamic time warping.
 *
 * @param  cost            The cumulated cost matrix
 * @param  alignmentLength Pointer to the variable that will hold the returned
 * array's size
 * @return                 An array containing the two alignment paths in
 * sequence. Both paths have the same length, therefore the first one will be
 * in the first half of the array and the second in the second one.
 */
size_t* trackback(const Eigen::ArrayXXd& cost, size_t* alignmentLength) {

	size_t i = cost.rows();
	size_t j = cost.cols();


	// Start to create the path from the last element of the cost matrix.
	std::list<size_t> path1, path2;
	path1.push_front(--i);
	path2.push_front(--j);


	while (i > 0 && j > 0) {

		const double nearCost[] =
			{cost(i - 1, j - 1), cost(i - 1, j), cost(i, j - 1)};

		size_t least = std::min_element(nearCost, nearCost + 3) - nearCost;

		path1.push_front((least == 0 || least == 1) ? --i : i);
		path2.push_front((least == 0 || least == 2) ? --j : j);

	}

	// One of the indexes may still be greater than one if the path hits a border
	// of the cost matrix, in this case the path must be completed with a straight
	// line to the first element of the cost matrix.
	while (i > 0) {
		path1.push_front(--i);
		path2.push_front(0);
	}

	while (j > 0) {
		path1.push_front(0);
		path2.push_front(--j);
	}


	*alignmentLength = path1.size()*2;
	size_t* alignment = (size_t*)malloc(*alignmentLength * sizeof(size_t));
	std::copy(path1.begin(), path1.end(), alignment);
	std::copy(path2.begin(), path2.end(), alignment + path1.size());

	return alignment;

}


/**
 * Compute the set of indices `path1, path2` that give the alignment of two
 * sequences over their last dimension by dynamic time warping.
 *
 * @param  sequence1       The first sequence to be aligned
 * @param  sequence2       The second sequence to be aligned
 * @param  alignmentLength Pointer to the variable that will hold the returned
 * array's size
 * @return                 An array containing the two alignment paths in
 * sequence. Both paths have the same length, therefore the first one will be
 * in the first half of the array and the second in the second one.
 */
size_t* dtw(
	const Eigen::MatrixXd& sequence1,
	const Eigen::MatrixXd& sequence2,
	size_t* alignmentLength
) {

	size_t length1 = sequence1.cols();
	size_t length2 = sequence2.cols();

	Eigen::ArrayXXd cost = 1 - (sequence1.adjoint() * sequence2).array();


	// Fill the first column...
	for (size_t i = 1; i < length1; i++) {
		cost(i, 0) = cost(i - 1, 0) + cost(i, 0);
	}

	// ...and the first row of the cost matrix.
	for (size_t j = 1; j < length2; j++) {
		cost(0, j) = cost(0, j - 1) + cost(0, j);
	}

	// Compute the cumulated cost of the remaining elements
	for (size_t i = 1; i < length1; i++) {
		for (size_t j = 1; j < length2; j++) {

			const double nearCost[] =
				{cost(i - 1, j - 1), cost(i - 1, j), cost(i, j - 1)};

			cost(i, j) = cost(i, j) + *std::min_element(nearCost, nearCost + 3);

		}
	}


	return trackback(cost, alignmentLength);

}
