-- RenameColumn
ALTER TABLE "users" RENAME COLUMN "username" TO "name";

-- RenameIndex
ALTER INDEX "users_username_key" RENAME TO "users_name_key";
