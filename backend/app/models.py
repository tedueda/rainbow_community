from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey, CheckConstraint, UniqueConstraint, BigInteger, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    display_name = Column(String(100), nullable=False)
    membership_type = Column(String(20), default="premium")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint("membership_type IN ('free', 'premium', 'admin')", name="check_membership_type"),
    )
    
    profile = relationship("Profile", back_populates="user", uselist=False)
    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    reactions = relationship("Reaction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    point_events = relationship("PointEvent", back_populates="user")
    user_awards = relationship("UserAward", back_populates="user")
    media_assets = relationship("MediaAsset", back_populates="user")
    reviews = relationship("Review", back_populates="user")

class Orientation(Base):
    __tablename__ = "orientations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profiles = relationship("Profile", back_populates="orientation")

class Gender(Base):
    __tablename__ = "genders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profiles = relationship("Profile", back_populates="gender")

class Pronoun(Base):
    __tablename__ = "pronouns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    profiles = relationship("Profile", back_populates="pronoun")

class Profile(Base):
    __tablename__ = "profiles"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    handle = Column(String, unique=True, nullable=False)
    bio = Column(Text)
    avatar_url = Column(String(500))
    orientation_id = Column(Integer, ForeignKey("orientations.id"), default=1)
    gender_id = Column(Integer, ForeignKey("genders.id"), default=1)
    pronoun_id = Column(Integer, ForeignKey("pronouns.id"), default=1)
    birthday = Column(Date)
    location = Column(String(100))
    website = Column(String(255))
    avatar_url = Column(String(500))
    banner_url = Column(String(500))
    is_profile_public = Column(Boolean, default=False)
    show_orientation = Column(Boolean, default=False)
    show_gender = Column(Boolean, default=False)
    show_pronoun = Column(Boolean, default=False)
    show_birthday = Column(Boolean, default=False)
    show_location = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="profile")
    orientation = relationship("Orientation", back_populates="profiles")
    gender = relationship("Gender", back_populates="profiles")
    pronoun = relationship("Pronoun", back_populates="profiles")

class MediaAsset(Base):
    __tablename__ = "media_assets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    url = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(BigInteger)
    width = Column(Integer)
    height = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="media_assets")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    icon = Column(String(100))  # Lucide icon name
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    subcategories = relationship("Subcategory", back_populates="category")
    posts = relationship("Post", back_populates="category")

class Subcategory(Base):
    __tablename__ = "subcategories"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('category_id', 'slug', name='uq_category_subcategory_slug'),
    )
    
    category = relationship("Category", back_populates="subcategories")
    posts = relationship("Post", back_populates="subcategory")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200))
    body = Column(Text, nullable=False)
    visibility = Column(String(20), default="public")
    youtube_url = Column(String(500))
    media_id = Column(Integer, ForeignKey("media_assets.id"))
    
    # 新カテゴリーシステム（外部キー）
    category_id = Column(Integer, ForeignKey("categories.id"))
    subcategory_id = Column(Integer, ForeignKey("subcategories.id"))
    
    # 旧カテゴリー（後方互換性のため残す、後で削除予定）
    category = Column(String(50))
    subcategory = Column(String(100))
    
    post_type = Column(String(20), server_default='post', nullable=False)
    slug = Column(String(200), unique=True, index=True)
    status = Column(String(20), server_default='published', nullable=False)
    og_image_url = Column(String(500))
    excerpt = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint("visibility IN ('public', 'members', 'followers', 'private')", name="check_post_visibility"),
        CheckConstraint("post_type IN ('post', 'blog', 'tourism')", name="check_post_type"),
        CheckConstraint("status IN ('draft', 'published')", name="check_post_status"),
    )
    
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")
    tags = relationship("Tag", secondary="post_tags", back_populates="posts")
    media = relationship("MediaAsset")
    media_assets = relationship("MediaAsset", secondary="post_media", order_by="PostMedia.order_index")
    tourism_details = relationship("PostTourism", back_populates="post", uselist=False)
    
    # 新カテゴリーとのリレーション
    category_rel = relationship("Category", back_populates="posts")
    subcategory_rel = relationship("Subcategory", back_populates="posts")

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"))
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id])

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    posts = relationship("Post", secondary="post_tags", back_populates="tags")

class PostTag(Base):
    __tablename__ = "post_tags"
    
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

class PostMedia(Base):
    __tablename__ = "post_media"
    
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)
    media_asset_id = Column(Integer, ForeignKey("media_assets.id"), primary_key=True)
    order_index = Column(Integer, nullable=False, server_default='0')

class PostTourism(Base):
    __tablename__ = "posts_tourism"
    
    post_id = Column(Integer, ForeignKey("posts.id"), primary_key=True)
    prefecture = Column(String(50))
    event_datetime = Column(DateTime(timezone=True))
    meet_place = Column(String(200))
    meet_address = Column(String(500))
    tour_content = Column(Text)
    fee = Column(Integer)
    contact_phone = Column(String(20))
    contact_email = Column(String(200))
    deadline = Column(DateTime(timezone=True))
    attachment_pdf_url = Column(String(500))
    
    post = relationship("Post", back_populates="tourism_details")

class Follow(Base):
    __tablename__ = "follows"
    
    follower_user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    followee_user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'accepted', 'blocked')", name="check_follow_status"),
        CheckConstraint("follower_user_id != followee_user_id", name="check_no_self_follow"),
    )

class Reaction(Base):
    __tablename__ = "reactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(String(20), nullable=False)
    target_id = Column(Integer, nullable=False)
    reaction_type = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("target_type IN ('post', 'comment', 'review')", name="check_reaction_target_type"),
        CheckConstraint("reaction_type IN ('like', 'love', 'support', 'respect')", name="check_reaction_type"),
        UniqueConstraint("user_id", "target_type", "target_id", "reaction_type", name="unique_user_reaction"),
    )
    
    user = relationship("User", back_populates="reactions")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)
    payload = Column(JSON)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="notifications")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_type = Column(String(20), nullable=False)
    target_id = Column(Integer, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="open")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint("target_type IN ('post', 'comment', 'review', 'user')", name="check_report_target_type"),
        CheckConstraint("status IN ('open', 'under_review', 'resolved', 'dismissed')", name="check_report_status"),
    )

class Block(Base):
    __tablename__ = "blocks"
    
    blocker_user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    blocked_user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("blocker_user_id != blocked_user_id", name="check_no_self_block"),
    )

class ContentItem(Base):
    __tablename__ = "content_items"
    
    id = Column(Integer, primary_key=True, index=True)
    item_type = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    creator = Column(String(200))
    release_year = Column(Integer)
    isbn = Column(String(20))
    url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("item_type IN ('book', 'movie', 'drama', 'comic')", name="check_content_item_type"),
    )
    
    reviews = relationship("Review", back_populates="item")

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("content_items.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    title = Column(String(200))
    body = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
        UniqueConstraint("item_id", "user_id", name="unique_user_item_review"),
    )
    
    item = relationship("ContentItem", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

class PointEvent(Base):
    __tablename__ = "point_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    points = Column(Integer, nullable=False)
    ref_type = Column(String(20))
    ref_id = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="point_events")

class Award(Base):
    __tablename__ = "awards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    threshold_points = Column(Integer, nullable=False)
    prize_amount_yen = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user_awards = relationship("UserAward", back_populates="award")

class UserAward(Base):
    __tablename__ = "user_awards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    award_id = Column(Integer, ForeignKey("awards.id"), nullable=False)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint("user_id", "award_id", name="unique_user_award"),
    )
    
    user = relationship("User", back_populates="user_awards")
    award = relationship("Award", back_populates="user_awards")

# ===== Matching domain models =====

class MatchingProfile(Base):
    __tablename__ = "matching_profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    display_flag = Column(Boolean, nullable=False, default=True)
    prefecture = Column(String(100), nullable=False, default="")
    age_band = Column(String(50))  # e.g., '20s_early', '30s_late'
    occupation = Column(String(100))
    income_range = Column(String(100))
    meet_pref = Column(String(50))  # 旧フィールド（互換性のため残す）
    meeting_style = Column(String(50))  # 新フィールド: 'msg_first', 'voice_after', etc.
    bio = Column(Text)
    identity = Column(String(50))  # e.g., 'gay','lesbian','transgender','bisexual','questioning','other'
    avatar_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")


class Hobby(Base):
    __tablename__ = "hobbies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MatchingProfileHobby(Base):
    __tablename__ = "matching_profile_hobbies"

    profile_id = Column(Integer, ForeignKey("matching_profiles.user_id"), primary_key=True)
    hobby_id = Column(Integer, ForeignKey("hobbies.id"), primary_key=True)


class MatchingProfileImage(Base):
    __tablename__ = "matching_profile_images"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("matching_profiles.user_id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("profile_id", "display_order", name="unique_profile_order"),
        CheckConstraint("display_order >= 0 AND display_order < 5", name="check_order_range"),
    )


class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("from_user_id", "to_user_id", name="uniq_like_from_to"),
        CheckConstraint("status IN ('active','withdrawn')", name="check_like_status"),
    )


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user_a_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_b_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    active_flag = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("user_a_id", "user_b_id", name="uniq_match_pair"),
        CheckConstraint("user_a_id != user_b_id", name="check_match_distinct_users"),
    )


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
