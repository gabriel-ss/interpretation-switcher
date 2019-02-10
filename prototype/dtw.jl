"""
	dtw(sequence1::Matrix{Cdouble}, sequence2::Matrix{Cdouble}) -> (path1, path2)

Compute the set of indices `path1, path2` that give the alignment of two
sequences over their last dimension by dynamic time warping.

Returns two vectors representing the path.
"""
function dtw(
	sequence1::Matrix{Cdouble},
	sequence2::Matrix{Cdouble}
)

	length1 = size(sequence1)[end]
	length2 = size(sequence2)[end]
	cost = 1 .- sequence1'*sequence2


	# Fill the first column...
	for i in 2:length1
		cost[i, 1] = cost[i - 1, 1] + cost[i, 1]
	end

	# ...and the first row of the cost matrix.
	for j in 2:length2
		cost[1, j] = cost[1, j - 1] + cost[1, j]
	end

	# Compute the cumulated cost of the remaining elements
	for i in 2:length1
		for j in 2:length2
			cost[i, j] = cost[i, j] +
				min(cost[i - 1, j], cost[i - 1, j - 1], cost[i, j - 1])
		end
	end


	return trackback(cost)
end


"""
	trackback(cost::AbstractMatrix) -> (path1, path2)

Compute the lowest cost path from a cost array. Returns two vectors
representing the path.
"""
function trackback(cost::Matrix{Cdouble})

	i, j = size(cost)
	# Start to create the path from the last element of the cost matrix.
	path1, path2 = [i], [j]

	while i > 1 && j > 1
		least = argmin([cost[i-1,j-1], cost[i-1,j], cost[i,j-1]])

		# Everytime that the minimal cost is reached by going back along one
		# dimension, decrease the corresponding index.
		push!(path1, (least in [1 2] ? i-=1 : i))
		push!(path2, (least in [1 3] ? j-=1 : j))
	end


	# One of the indexes may still be greater than one if the path hits a border
	# of the cost matrix, in this case the path must be completed with a straight
	# line to the first element of the cost matrix.
	if i > 1
		append!(path1, i-1:-1:1)
		append!(path2, ones(length(path1) - length(path2)))
	end

	if j > 1
		append!(path2, j-1:-1:1)
		append!(path1, ones(length(path2) - length(path1)))
	end


	return reverse(path1), reverse(path2)
end
