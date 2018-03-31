SRC = background.js \
	  calendar128.png \
	  calendar32.png \
	  manifest.json \
	  options.html \
	  options.js \
	  rewriter.js

TARGET = tsutaya-comic-release-calendar.zip

all: zip

zip: $(TARGET)

$(TARGET): $(SRC)
	zip $(TARGET) $(SRC)
