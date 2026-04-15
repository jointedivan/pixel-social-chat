from pydantic import BaseModel, ConfigDict


class UserSettingsBase(BaseModel):
    theme: str = "dark"  # "light" | "dark" | "auto"
    notifications_enabled: bool = True
    sound_enabled: bool = True
    show_online_status: bool = True
    allow_friend_requests: bool = True


class UserSettingsRead(UserSettingsBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    notifications_enabled: bool | None = None
    sound_enabled: bool | None = None
    show_online_status: bool | None = None
    allow_friend_requests: bool | None = None
