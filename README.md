# pomeranian

[![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-7fffff?style=flat&labelColor=ff80ff)](https://github.com/neostandard/neostandard)

Like Yarn, but for Maven.

## Installation

```bash
yarn global add @timdp/pomeranian
```

```bash
npm install --global @timdp/pomeranian
```

## Usage

You must run `pomeranian` (or `pom`) in a directory with a Maven `pom.xml`.

Try `pom --help` for quick instructions.

### Adding Dependencies

Add dependency by group ID, artifact ID and version:

```bash
pomeranian add org.apache.commons:junit-jupiter:1.12.0
```

Or shorter:

```bash
pom a org.apache.commons:junit-jupiter:1.12.0
```

Or by URL:

```bash
pom a https://central.sonatype.com/artifact/org.apache.commons/junit-jupiter/1.12.0
```

Or use the latest version:

```bash
pom a org.apache.commons:junit-jupiter
```

```bash
pom a https://central.sonatype.com/artifact/org.apache.commons/junit-jupiter
```

Or search:

```bash
pom a junit
```

Need to change the scope? Use `--scope` or `-s`:

```bash
pom a org.junit.jupiter:junit-jupiter -s test
```

### Removing Dependencies

Remove dependency by group ID and artifact ID:

```bash
pomeranian remove org.apache.commons:junit-jupiter
```

Or shorter:

```bash
pom r org.apache.commons:junit-jupiter
```

Or by artifact ID only:

```bash
pom r junit-jupiter
```

### Unsupervised

Add `--yes` or `-y` to accept all prompts.

## Author

[Tim De Pauw](https://tmdpw.eu/)

## License

MIT
