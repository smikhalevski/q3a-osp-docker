# https://hub.docker.com/_/ubuntu
FROM ubuntu:18.04

ENV ioq3_repo https://github.com/ioquake/ioq3.git

ENV ioq3_lib_dir /usr/lib/ioquake3

RUN apt-get update

# Build ioquake3 server from sources
# https://github.com/ioquake/ioq3
ENV ioq3_build_dir /var/tmp/ioq3_build
ENV build_libs 'git build-essential libsdl2-2.0 libsdl2-dev'
# http://www.libsdl.org
RUN apt-get install -y ${build_libs}
RUN git clone ${ioq3_repo} ${ioq3_build_dir}
RUN cd ${ioq3_build_dir}; make; make copyfiles

# Move
RUN mv ${ioq3_build_dir}/build/release-linux-x86_64 ${ioq3_lib_dir}
RUN mv ${ioq3_lib_dir}/ioq3ded.x86_64 ${ioq3_lib_dir}/ioq3ded

# Cleanup
RUN rm -rf $ioq3_build_dir
RUN apt-get purge -y ${build_libs}
RUN apt-get autoremove -y

# Assets
COPY ./q3a ${ioq3_lib_dir}

EXPOSE 27960/tcp
EXPOSE 27960/udp

WORKDIR ${ioq3_lib_dir}
CMD ["./ioq3ded", "+set", "dedicated", "1", "+set", "fs_game", "osp", "+set", "com_hunkmegs", "64", "+exec", "instagib.cfg", "+set", "rconpassword", "password"]
