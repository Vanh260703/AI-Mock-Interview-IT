---
description: Auto commit và push toàn bộ thay đổi lên GitHub với commit message được cung cấp
argument-hint: "<commit message>"
---

Thực hiện các bước sau để commit và push code lên GitHub:

**Commit message**: $ARGUMENTS

1. Chạy `git status` để xem các file thay đổi.
2. Chạy `git add -A` để stage toàn bộ thay đổi.
3. Chạy `git commit -m "$ARGUMENTS"` để tạo commit.
4. Chạy `git push` để push lên remote.
5. Báo kết quả: nếu thành công thì hiển thị commit hash và tên branch; nếu lỗi thì hiển thị lỗi cụ thể.

Không cần hỏi xác nhận, thực hiện thẳng luôn.
