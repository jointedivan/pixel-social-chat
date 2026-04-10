import bcrypt


def hash_password(plain_password: str) -> str:
    """Хеширует пароль через bcrypt (алгоритм внутри bcrypt — blowfish)."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка пароля против сохранённого хеша (для будущего /login)."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )
