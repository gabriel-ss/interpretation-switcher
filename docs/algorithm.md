
# Music alignment algorithm

It is not uncommon for a particular musical composition to be interpreted several times producing multiple recordings of it. In certain practical applications it is interesting to analyze the set of recordings and find a temporal alignment between them, that is, to find a description of which instants of a recording are equivalent to a given instant of another.

In order to accomplish this task, an alignment algorithm is proposed, which can be divided into two main steps: chroma vector extraction and DTW computation. It is, however, more interesting from a didactic point of view to present them in the reverse order to the one in which they occur.

## DTW

The Dynamic Time Warping (DTW) algorithm is widely used in the context of signal alignment. By feeding the algorithm with two sequences of elements it returns a sequence of ordered pairs that indicate the best equality relation between a sequence of elements with another of the according to the criteria defined in DTW.


The calculation of the DTW takes place in two stages:
1. Computation of the cost matrix
2. Evaluation of optimal path

Both steps are described below:

## Computation of the cost matrix

The first step is to create an array containing the cost of aligning each element of the two sequences. The final result of the DTW will be the path that goes from one corner to another of this matrix accumulating the lowest possible cost.

Given two sequences $s1$ and $s2$ with, respectively, $n$ and $m$ elements, the cost matrix will be of size $n \times m$. In order to compute the value of the matrix elements, different distance measures can be used, such as the euclidean or cosine. At first, with the distance function $d(a, b)$ defined, the DTW could be computed by calculating the cost matrix $C$

$$C_{i,j} = d(s1_i, s2_j)$$

and choosing the path that crosses this matrix accumulating the lowest cost. However, it would be necessary to calculate the cost of all paths that run through the matrix. Taking into account that the number of paths grows exponentially with the number of elements, it would be impracticable to implement this algorithm.

The solution to this problem is to define the cost matrix so as to represent the accumulated cost to each element instead of the individual cost of the element. Considering that it is desired to reduce the total cost of the path from $C_{1,1}$ to $Cm, n$ one can redefine the cost matrix as

$$C_{i,j} = d(s1_i, s2_j) + \min(C_{i-1,j}, C_{i-1,j-1}, C_{i,j-1})$$

so as to take into account in calculating each element the cost of the best path to it. Thus, the complete calculation of the DTW can be performed with complexity $\mathcal{O}(mn)$.

## Evaluation of optimal path

It follows from the definition chosen for the cost matrix that the cost of the best path is given by the matrix element $C_{m,n}$. To find out which path this is, simply walk towards the $C_{1,1}$ element by looking at the three elements $C_{i-1,j}, C_{i-1,j-1}, C_{i,j-1}$ adjacent and immediately preceding inserting the indices in the path. The procedure is as follows:
- The first element of the path is the pair $(m,n)$
- The next element to be inserted is defined by the neighborhood of the cost matrix around the point indexed by the current element $(i,j)$:
   - If the lowest cost element is $C_{i-1,j}$, insert $(i-1,j)$ in the path
   - If the lowest cost element is $C_{i-1,j-1}$, insert $(i-1,j-1)$ in the path
   - If the lowest cost element is $C_{i,j-1}$, insert $(i,j-1)$ in the path
- Repeat the previous step until the pair $(1,1)$ is inserted.

The result of this procedure is a vector of ordered pairs that indicate which elements are best aligned in each of the sequences.

With the DTW defined there is already a method to find the alignment between two sequences, which was the original purpose of the proposed algorithm. It is not absurd to think that the algorithm would then be summarized to feed the DTW with the two signals that one wants to align. In fact it is theoretically possible to directly feed the DTW with audio signals. Such an approach, however, brings two problems.

The first problem is the computational cost inherent in it. As previously stated, DTW has a complexity of $\mathcal{O} (mn)$. For short signals giving small values of $m$ and $n$ this does not prevent the application of the DTW, but in an audio processing context in which the signals have thousands of samples per second the computational cost can make the use of the algorithm impracticable .

The second is the untruth of the hypothesis that the best alignment between two sequences can be found by directly comparing each of their samples. For some applications, it may be much more interesting to analyze a given instant of time taking into account what occurs in its neighborhood. It is also possible to ignore certain characteristics of the signal that are originally encoded in their samples and highlight others that are not so obvious.

Both problems can be solved by adding a step to the alignment algorithm. At no point during the DTW's description was it specified that the elements on which distance measurements were calculated should be scalar. In fact, the only constraint imposed on the sequences to be aligned is that dictated by the distance function chosen, if it is defined for that, it is possible to apply the DTW in sequences of any type of elements.

For the purposes of the alignment algorithm it is convenient to use the distance of the cosines
$$d(\vec{u} , \vec{v}) = 1 - \frac{\vec{u} \cdot \vec{v}}{|\vec{u}|\ |\vec{v}|}$$
which, while not meeting all criteria that define the mathematical concept of distance, has interesting properties. It is, for example, insensitive to the vector modulus, a desired characteristic if the power of the original signals influences the magnitude of the vectors over which the distance is calculated, since it makes the process resistant to differences in normalization between the recordings.

Once this choice is made, we can extract vectors that condense the information present in short periods of time from the original signals taking into account only their pertinent characteristics and, to these new vector sequences, apply the DTW. And that is exactly what is proposed for the first step of the alignment algorithm: extracting sequences of chroma vectors. The alignment ceases to be between the signal samples and becomes between the time windows used during the extraction of the chroma vectors.

## Chroma vector extraction

Chroma features are vectors of 12 elements computed on the spectrum of a signal that try to represent the presence of each of the notes of the tempered scale by condensing their octaves. It makes a lot of sense to use chroma vectors to characterize each part of the signals since they synthesize information about the melody of a song. In this way, different recordings that follow the same score can be aligned.

The extraction process consists of:
1. Calculating the STFT of the signal
2. Grouping near frequencies in pitch classes defined by the MIDI standard
3. Summing the classes that are in different octaves, but representing the same note
4. Compressing the vectors
5. Normalizing the result

### STFT

The STFT is defined as:

$$X_i[k]=\sum_{n=1}^N{x_i[n]w[n]e^{-2\pi kn/N}}$$

where $x_i[n]$ is the $i$th frame of the original signal $x[n]$ containing $N$ samples, obtained from the windowing by a function $w[n]$ and $k$ is the number of the harmonic.

### Pitch classification

The Fourier transform provides the frequencial components distributed in a linear scale. The distribution of the notes by the spectrum, however, occurs in a logarithmic way. For this reason it is necessary to group the resulting components of the STFT into classes that represent the notes of the tempered scale before performing the grouping of octaves. For this, the pitch concept defined by the MIDI standard is used:

$$p(f) = 69 +12\log_2\left(\frac{f}{440 \mathrm{Hz}}\right).$$

By taking the inverse it is possible to find the frequency represented by a certain pitch:

$$f(p) = 2^{(p - 69)/12}440 \mathrm{Hz}.$$

Knowing that the standard defines $p$ in the interval $[0, 127]$ it is possible to classify the frequency components by grouping in a given $p_i$ all of those that are in range $[f(p_i - 0.5), f(p_i + 0.5)]$.

It is then defined
$$p_i = \sum_{f = f(p_i - 0.5)}^{f(p_i + 0.5)} |f|^2.$$
The result of this step is a vector sequence with 128 elements each.

### Grouping of notes

The next step is to group the 128 classes to generate chroma vectors $\vec{c}$ with 12 elements, each representing a note. The $i$-th element of the vector is given by
$$c_i = \sum p_{i + 12n} , \quad i + 12n \in [0, 127]$$
where $n$ is a natural number.

In this mapping the notes A0, A1, A2 and all other notes A, for example, are represented by the same element in order to condense the melodic information distributed by the octaves.

### Compression

The resulting chroma vector already has the desired shape, but the information present in its elements has a very high dynamic range making it interesting to apply a compression to them. To do this, one can use the function

$$\log_{10}(1 + \gamma c_i)$$

where $\gamma$ is the compression factor to be applied to each of the vector elements.

### Normalization

Finally, the chroma vectors must be normalized to remove the influence of the normalization of the original signals. At first it would be enough to divide the components of the vector by its norm, but in moments of silence in the original signal the result of the extraction of the chroma features are relatively random vectors due to the lack of relevant information in these time intervals. Applying the same normalization to these vectors could disrupt the alignment process. For this reason it is convenient in this step to define a minimum norm required $\epsilon$ for the vectors to be normalized. The vectors that have a norm smaller than this limit are replaced by a generic vector with all the same components and with unitary norm.

The mathematical expression is:
$$\hat{c} = \begin{cases}
	   \frac{\vec{c}}{|\vec{c}|}   & |\vec{c}| \ge \epsilon\\
	   \frac{(1,1,1...1)}{\sqrt{12}}   & |\vec{c}| \lt \epsilon\\
    \end{cases}$$

After this step the chroma vector sequences are ready to feed the DTW thus concluding the description of the alignment algorithm.
