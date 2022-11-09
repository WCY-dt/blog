---
layout: post
title:  "Differential Privacy"
date:   2022-10-08 00:00:00 +0800
categories: 安全
tags: 差分隐私
comments: 1
mathjax: true
copyrights: 原创
---

# 定义推导

设有一事件 $$x$$，在 $$P,Q$$ 中的概率(Probability)分别为
$$
p(x),q(x)
$$
其包含的信息(Information)为
$$
I(x)=-\ln{p(x)}
$$
香农熵(Shannon Entropy)为
$$
\begin{align}
H(P)&=\mathbb{E}_{x\sim P}\left[I(p)\right]\\
&=\sum{p(x)I(p)}\\
&=-\sum{p(x)\ln{p(x)}}
\end{align}
$$
交叉熵(Cross-Entropy)为
$$
\begin{align}
H(P,Q)&=\mathbb{E}_{x\sim P}\left[I(q)\right]\\
&=\sum{p(x)I(q)}\\
&=-\sum{p(x)\ln{q(x)}}
\end{align}
$$
K-L 散度(K-L divergence)，即信息增益为
$$
\begin{align}
D_{KL}(P\Vert Q)&=H(P,Q)-H(P)\\
&=-\sum{p(x)\ln{q(x)}}+\sum{p(x)\ln{p(x)}}\\
&=\sum{p(x)\ln{\frac{p(x)}{q(x)}}}\\
&=\mathbb{E}_{x\sim P}\left[\ln{\frac{p(x)}{q(x)}}\right]
\end{align}
$$
其含义为使用 $$Q$$ 替代 $$P$$ 后熵的变化。

瑞丽熵(Renyi Entropy)是上面提到的香农熵的推广形式。瑞丽熵为
$$
\begin{align}
H_{\alpha}(X)&=\frac{1}{1-\alpha}\log{\left(\sum_{i=1}^{n}{p_i^\alpha}\right)}\\
&=\frac{\alpha}{1-\alpha}\log{{\left(\sum_{i=1}^{n}{p_i^\alpha}\right)}^{\frac{1}{\alpha}}}\\
&=\frac{\alpha}{1-\alpha}\log{{\Vert p\Vert}_{\alpha}}
\end{align}
$$
其中，$$\alpha\geq0,\alpha\neq1$$。

当 $$\alpha=0$$ 时，为哈特利熵(Hartley Entropy)，或称最大熵
$$
\begin{align}
H_0(X)&=\frac{1}{1-0}\log{\left(\sum_{i=1}^{n}{p_i^0}\right)}\\
&=\log{n}
\end{align}
$$
当 $$\alpha\rightarrow 1$$ 时，为香农熵
$$
\begin{align}
H_1(X)&=\lim_{\alpha\rightarrow 1}\frac{1}{1-\alpha}\log{\left(\sum_{i=1}^{n}{p_i^\alpha}\right)}\\
&=-\sum_{i=1}^{n}{p_i\ln{p_i}}
\end{align}
$$
当 $$\alpha\rightarrow \infty$$ 时，为最小熵
$$
\begin{align}
H_\infty(X)&=\lim_{\alpha\rightarrow \infty}\frac{\alpha}{1-\alpha}\log{{\Vert p \Vert}_\alpha}\\
&=-\log{\max_{i}{p_i}}
\end{align}
$$
类似的，瑞丽散度(Renyi Divergence)为
$$
D_\alpha(P\Vert Q)=\frac{1}{\alpha-1}\log\left(\sum_{i=1}^{n}{q_i\frac{p_i^\alpha}{q_i^\alpha}}\right)
$$
当 $$\alpha\rightarrow 1$$ 时，为 K-L 散度
$$
\begin{align}
D_1(P\Vert Q)&=\lim_{\alpha\rightarrow 1}\frac{1}{\alpha-1}\log\left(\sum_{i=1}^{n}{q_i\frac{p_i^\alpha}{q_i^\alpha}}\right)\\
&=\sum_{i=1}^{n}{p_i\log\frac{p_i}{q_i}}
\end{align}
$$
当 $$\alpha\rightarrow \infty$$ 时，为最大散度
$$
\begin{align}
D_\infty(P\Vert Q)&=\lim_{\alpha\rightarrow \infty}\frac{1}{\alpha-1}\log\left(\sum_{i=1}^{n}{q_i\frac{p_i^\alpha}{q_i^\alpha}}\right)\\
&=\log{\max_{i}\frac{p_i}{q_i}}
\end{align}
$$
其含义是两个分布的最大差距。

对最大散度进行约束得到
$$
\begin{align}
\log{\max_{i}\frac{p_i}{q_i}}&\leq\varepsilon\\
\max_{i}\frac{p_i}{q_i}&\leq e^{\varepsilon}\\
p_i&\leq e^{\varepsilon}q_i
\end{align}
$$
其中，$$\varepsilon$$ 被称为隐私预算。

现在，我们可以给出差分隐私的定义：

设有查询函数 $$f(X):X\rightarrow \mathbb{R}$$，给出随机噪声 $$r$$，查询结果为 $$M(X)=f(X)+r$$。规定隐私预算为 $$\varepsilon$$，对于汉明距离为 $$1$$ 的两个数据集 $$X,X^\prime$$ 及任意输出集合 $$S$$，应当满足
$$
\Pr\left[M(X)\in S\right]\leq e^{\varepsilon}\Pr\left[M(X^\prime)\in S\right]
$$
记作 $$\varepsilon-DP$$。

$$\varepsilon$$ 应当越小越好，但过小的 $\varepsilon$ 将使得可用性过低。因此有差分隐私的松弛形式
$$
\Pr\left[M(X)\in S\right]\leq e^{\varepsilon}\Pr\left[M(X^\prime)\in S\right]+\delta
$$
记作 $$(\varepsilon,\delta)-DP$$。

对应到上面最大散度的推导公式，其表示的是只计算 $$p_i\geq\delta$$ 情况下的最大散度。

# 差分隐私的机制

查询分为数值型（连续）和非数值型（离散）。对于数值型，常使用 Laplace 或者 Gauss 机制。对于非数值型，则使用指数机制。

## Laplace 机制

Laplace 机制为数值型查询提供严格的 $$\varepsilon-DP$$

Laplace 分布的概率密度函数为
$$
f(x\mid\mu,\sigma)=\frac{1}{2\sigma}e^{-\frac{\mid x-\mu\mid}{\sigma}}
$$
记为
$$
L(\mu,\sigma)
$$
查询函数最大的变化范围为
$$
\Delta f=\max_{X,X^\prime}{\Vert f(X)-f(X^\prime)\Vert}_1
$$
其被称为敏感度。

则噪声
$$
r\sim L\left(0,\frac{\Delta f}{\varepsilon}\right)
$$
满足 $$\varepsilon-DP$$

## Gauss 机制

Gauss 机制为数值型查询提供松弛的 $$(\varepsilon,\delta)-DP$$

Gauss 分布的概率密度函数为
$$
f(x\mid\mu,\sigma)=\frac{1}{\sigma\sqrt{2\pi}}e^{-\frac{{(x-\mu)}^2}{2\sigma^2}}
$$
记为
$$
N(\mu,\sigma)
$$
则对于任意 $$\delta\in(0,1),\sigma>\frac{\sqrt{2\ln\left(\frac{1.25}{\delta}\right)}\Delta f}{\varepsilon}$$，噪声
$$
r\sim N(0,\sigma^2)
$$
满足 $$(\varepsilon,\delta)-DP$$

## 指数机制

指数机制为非数值型查询提供严格的 $$\varepsilon-DP$$

指数分布的概率密度函数为

设 $$S_i$$ 为数据集 $$X$$ 输出的一个结果，则其得分通过打分函数 $$u(X,S_i)$$ 得到。

敏感度
$$
\Delta u=\max_{X,X^\prime}{\Vert u(X,S_i)-u(X^\prime,S_i)\Vert}_1
$$
则指数机制以
$$
M(X,u,S_i)\sim e^{\frac{\varepsilon u(X,S_i)}{2\Delta u}}
$$
的概率输出结果 $$S_i$$。

概率值
$$
\Pr\left[S_i\right]=\frac{e^{\frac{\varepsilon u(X,S_i)}{2\Delta u}}}{\sum_j{e^{\frac{\varepsilon u(X,S_j)}{2\Delta u}}}}
$$

# 差分隐私的属性

## Sequential composition

设 $$M_i(X)$$ 作用于同一个数据集 $$X$$，其满足 $$\varepsilon_i-DP$$，则这些算法的集合满足 $$\left(\sum_i\varepsilon_i\right)-DP$$

## Parallel composition

设 $$M(X)$$ 满足 $$\varepsilon-DP$$，$$\bigcup X_i=X$$，则 $$M(X_i)$$ 满足 $$\varepsilon-DP$$
