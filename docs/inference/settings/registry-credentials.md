---
title: 레지스트리 자격 증명
---

# 레지스트리 자격 증명

프라이빗 컨테이너 레지스트리에서 이미지를 당겨올 때 쓰는 로그인 정보를 미리 등록해 두는
화면입니다. 여기 등록하는 것은 컨테이너 레지스트리 로그인용 아이디·비밀번호이지, 추론
엔드포인트를 호출할 때 쓰는 API 키가 아닙니다. 추론 인증은
[인증](/guide/inference/authentication) 을 참고하세요.

<!-- SCREENSHOT: settings-registry-credentials -->

## 쓰이는 곳

[Docker 엔드포인트 생성](/inference/serverless/create-docker) 화면에서 이미지 URI 를
프라이빗 레지스트리 경로로 입력하면, 여기서 미리 등록해 둔 자격 증명 중에서 골라 연결할
수 있습니다. 매번 생성 화면에서 아이디·비밀번호를 새로 입력하지 않도록 미리 등록해
두는 것입니다.

## 등록·수정·삭제

새 자격 증명을 등록하고, 필요하면 값을 수정하거나 더는 쓰지 않는 것을 삭제할 수 있습니다.
삭제하면 그 자격 증명을 참조하던 Docker 엔드포인트의 이미지 재배포에 영향을 줄 수 있으니,
현재 어떤 엔드포인트가 이 자격 증명을 쓰고 있는지 확인한 뒤 지우는 것이 안전합니다.

## 다음

- [Docker 엔드포인트 생성](/inference/serverless/create-docker)
- [SSH 키](/inference/settings/ssh-keys)
- [인증](/guide/inference/authentication)
