module.exports = {
    apps: [
        {
            name: "nextjs-everytime", // pm2 name
            script: "./pm2_scripts.js",
            instances: 4, // 클러스터 모드 사용 시 생성할 인스턴스 수
            exec_mode: "cluster", // fork, cluster 모드 중 선택
            merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
            autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
            watch: false, // 파일이 변경되었을 때 재시작 할지 선택
            // max_memory_restart: "512M", // 프로그램의 메모리 크기가 일정 크기 이상이 되면 재시작한다.
        },
    ],
};
