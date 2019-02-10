CXX=clang++
LD=clang++
CXXFLAGS=-Wall -std=c++11 -pedantic -O2 -ffast-math -fPIC -I/usr/include/eigen3/ -D_FORTIFY_SOURCE=2 -DEIGEN_MPL2_ONLY -DNDEBUG
LDFLAGS=-Wall -std=c++11 -O2 -shared

all: libsndalign.so

.cpp.o:
	$(CXX) $(CXXFLAGS) -c $<

libsndalign.so: libsndalign.o stft.o chroma.o dtw.o
	$(LD) $(LDFLAGS) -o $@ $^

clean:
	rm ./*.o
